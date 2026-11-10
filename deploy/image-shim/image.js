/**
 * 生图:同步/异步翻译。
 *
 * 上游生图只有异步接口(提交 → 轮询 → 取图),而 new-api 的图片中继只支持
 * OpenAI 标准同步调用(必须 HTTP 200,见 relay/image_handler.go:100-105)。
 * 本模块替 new-api 跑完异步三步,对它装成一个普通的同步生图 API。
 *
 * 返回形态由 RETURN_MODE 决定:默认 b64(自己下载转 base64,不暴露上游域名),
 * 设成 url 则退回旧行为、直接透传上游图片地址。
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

/**
 * 把上游图片下载下来转成 base64。
 *
 * 为什么不直接把上游地址给客户:① 地址里带着上游域名,等于把货源告诉客户;
 * ② 上游结果只保留约 2 小时,客户来不及转存就 404。
 *
 * 边下边数字节,超过上限立刻掐断 —— 不能等整个 body 读完才发现太大,
 * 那时内存已经吃进去了(并发 5 路,一路失控就可能打爆容器)。
 */
async function downloadAsBase64(url, auth) {
  try {
    // 实测上游图片地址免鉴权可下载,但仍带上 Authorization:
    // 万一上游哪天收紧权限(它文档里已有这类说法),这条链路不会跟着断。
    const r = await fetchT(url, { headers: { Authorization: auth } }, CFG.downloadMs)
    if (!r.ok) return { error: `HTTP ${r.status}` }

    const ct = r.headers.get('content-type') || ''
    if (!ct.startsWith('image/')) return { error: `返回的不是图片 (${ct.slice(0, 40)})` }

    const declared = +(r.headers.get('content-length') || 0)
    if (declared > CFG.maxImageBytes) return { error: `图片过大 ${declared}B` }

    const chunks = []
    let size = 0
    for await (const chunk of r.body) {
      size += chunk.length
      if (size > CFG.maxImageBytes) return { error: `图片超过 ${CFG.maxImageBytes}B 上限` }
      chunks.push(chunk)
    }
    if (size === 0) return { error: '图片为空' }
    return { data: Buffer.concat(chunks).toString('base64') }
  } catch (e) {
    return { error: e.name === 'AbortError' ? '下载超时' : (e.message || e.name) }
  }
}

export async function generate(req, res, auth, body) {
  // ── 入参校验:非法输入直接拒绝,不浪费上游额度 ──
  let p
  try { p = JSON.parse(body) } catch { return fail(res, 400, '请求体不是合法 JSON', 'invalid_json') }
  if (!p?.model)  return fail(res, 400, '缺少 model 参数', 'missing_model')
  if (!p?.prompt) return fail(res, 400, '缺少 prompt 参数', 'missing_prompt')
  // n>1 会让 new-api 按张数计费,但上游异步只回一张 —— 收了多张的钱给一张图,先禁掉
  if (p.n != null && +p.n !== 1) return fail(res, 400, '当前仅支持 n=1', 'unsupported_n')
  // 上游只认单数 image 字段。实测传 images 时它既不报错也不读参考图,
  // 客户会拿到一张完全无关的图还照常扣费 —— 这里提前拦掉,不发给上游。
  if (p.images != null) {
    return fail(res, 400, '参考图请用 image 字段传图片 URL(字符串),本站不支持 images 数组', 'unsupported_images')
  }

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
      // 默认把图下载下来转 base64:上游图片地址带着上游域名,直接透传等于把货源
      // 告诉客户;而且上游结果只留约 2 小时,客户来不及转存就失效。
      let item
      if (CFG.returnMode === 'url') {
        item = { url: n.url }
      } else {
        const b64 = await downloadAsBase64(n.url, auth)
        if (b64.error) {
          log(`[download] ${taskId} 失败: ${b64.error}`)
          return fail(res, 502, '图片下载失败,请重试', 'image_download_failed')
        }
        item = { b64_json: b64.data }
      }
      log(`[ok] model=${p.model} task=${taskId} ${Math.round((Date.now() - t0) / 1000)}s ${CFG.returnMode}`)
      const out = JSON.stringify({ created: Math.floor(Date.now() / 1000), data: [item] })
      return res.writeHead(200, { 'Content-Type': 'application/json' }).end(out)
    }
  }
  log(`[task] ${taskId} 超时 (${CFG.maxWaitMs}ms)`)
  return fail(res, 504, '生成超时,请稍后重试', 'generation_timeout')
}
