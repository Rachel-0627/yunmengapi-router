/**
 * 生图:同步/异步翻译。
 *
 * 上游生图只有异步接口(提交 → 轮询 → 取图),而 new-api 的图片中继只支持
 * OpenAI 标准同步调用(必须 200 + data[].url,见 relay/image_handler.go:100-105)。
 * 本模块替 new-api 跑完异步三步,对它装成一个普通的同步生图 API。
 */

import { CFG, fail, fetchT, log } from './config.js'

/**
 * 上游轮询响应有两种形态(实测一种、文档一种),统一成 {state, url, reason}
 *   A: {"status":"completed","url":"https://..."}
 *   B: {"code":"success","data":{"status":"SUCCESS","data":{"data":[{"url":"..."}]}}}
 */
function normalize(j) {
  const d = (j && typeof j.data === 'object' && !Array.isArray(j.data) && j.data.status) ? j.data : j
  const s = String(d?.status ?? '').toLowerCase()
  const url = d?.url || d?.direct_url || d?.result_url ||
              d?.data?.data?.[0]?.url || d?.data?.[0]?.url || ''
  let state = 'pending'
  if (['completed', 'success', 'succeeded', 'finished'].includes(s)) state = 'done'
  else if (['failed', 'failure', 'cancelled', 'canceled', 'error'].includes(s)) state = 'failed'
  const reason = d?.fail_reason || d?.failReason || d?.error_message || d?.errorMessage ||
                 d?.message || d?.msg || d?.detail || d?.error?.message ||
                 (typeof d?.error === 'string' ? d.error : '') || ''
  return { state, url, reason }
}

export async function generate(req, res, auth, body) {
  // ── 入参校验:非法输入直接拒绝,不浪费上游额度 ──
  let p
  try { p = JSON.parse(body) } catch { return fail(res, 400, '请求体不是合法 JSON', 'invalid_json') }
  if (!p?.model)  return fail(res, 400, '缺少 model 参数', 'missing_model')
  if (!p?.prompt) return fail(res, 400, '缺少 prompt 参数', 'missing_prompt')
  // n>1 会让 new-api 按张数计费,但上游异步只回一张 —— 收了多张的钱给一张图,先禁掉
  if (p.n != null && +p.n !== 1) return fail(res, 400, '当前仅支持 n=1', 'unsupported_n')

  const t0 = Date.now()
  const H = { 'Content-Type': 'application/json', Authorization: auth }

  // ── ① 提交任务 ──
  let taskId
  try {
    const r = await fetchT(`${CFG.upstream}/v1/images/generations/async`,
      { method: 'POST', headers: H, body: JSON.stringify(p) }, CFG.reqMs)
    const txt = await r.text()
    let j; try { j = JSON.parse(txt) } catch { j = {} }
    // 上游对这条路径返回 200,但 202 也当成功(两条路径都给 task_id)
    if (r.status !== 200 && r.status !== 202) {
      log(`[submit] model=${p.model} 上游 ${r.status}`)
      return fail(res, r.status, j?.error?.message || `上游返回 ${r.status}`, 'upstream_error')
    }
    taskId = j.task_id || j.id
    if (!taskId) return fail(res, 502, '上游未返回任务号', 'no_task_id')
  } catch (e) {
    log(`[submit] model=${p.model} 异常 ${e.name}`)
    return fail(res, 504, e.name === 'AbortError' ? '提交任务超时' : '无法连接上游', 'submit_failed')
  }

  // ── ② 轮询直到出图 ──
  const deadline = t0 + CFG.maxWaitMs
  let softErrors = 0
  let raw = null
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, CFG.pollMs))
    let n
    try {
      const r = await fetchT(`${CFG.upstream}/v1/images/tasks/${encodeURIComponent(taskId)}`,
        { headers: { Authorization: auth } }, CFG.reqMs)
      if (!r.ok) {
        // 单次查询失败不立刻放弃,连续 5 次才判定失败(上游偶发抖动)
        if (++softErrors >= 5) return fail(res, 502, `任务查询持续失败 (${r.status})`, 'poll_failed')
        continue
      }
      softErrors = 0
      raw = await r.json()
      n = normalize(raw)
    } catch {
      if (++softErrors >= 5) return fail(res, 504, '任务查询超时', 'poll_timeout')
      continue
    }

    if (n.state === 'failed') {
      // 上游的失败字段名不固定,原样打出整个响应,避免再靠猜
      log(`[task] ${taskId} 失败: ${n.reason || '(无 reason 字段)'} | 原始响应: ${JSON.stringify(raw).slice(0, 600)}`)
      return fail(res, 502, n.reason || '上游生成失败', 'generation_failed')
    }
    if (n.state === 'done') {
      if (!n.url) return fail(res, 502, '任务完成但未返回图片地址', 'no_image_url')
      // ── ③ 组装成 OpenAI 标准同步响应 ──
      log(`[ok] model=${p.model} task=${taskId} ${Math.round((Date.now() - t0) / 1000)}s`)
      const out = JSON.stringify({ created: Math.floor(Date.now() / 1000), data: [{ url: n.url }] })
      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(out)
    }
  }
  log(`[task] ${taskId} 超时 (${CFG.maxWaitMs}ms)`)
  return fail(res, 504, '生成超时,请稍后重试', 'generation_timeout')
}
