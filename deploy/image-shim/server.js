/**
 * image-shim —— 生图接口的同步/异步翻译层
 *
 * 为什么需要它:
 *   上游的生图只有异步接口(提交任务 → 轮询 → 拿图),
 *   而 new-api 的图片中继只支持 OpenAI 标准的同步调用(必须 200 + data[].url)。
 *   两边对不上,客户拿到 bad_response_status_code。
 *
 * 它做什么:
 *   对 new-api 装成一个普通的同步生图 API,内部替它跑完异步三步。
 *   new-api 的鉴权、计费、日志、失败退款全部照常,源码一行不改。
 *
 * 链路:
 *   客户 → new-api(鉴权计费)→ 本服务 → 上游 /v1/images/generations/async
 *                                    → 上游 /v1/images/tasks/{id} 轮询
 *                                    ← 返回 {"created":..,"data":[{"url":..}]}
 *
 * 密钥:不落地。直接透传 new-api 发来的 Authorization 头。
 */

import http from 'node:http'

const CFG = {
  port: +(process.env.PORT || 8080),
  upstream: (process.env.UPSTREAM_BASE || '').replace(/\/+$/, ''),
  pollMs: +(process.env.POLL_INTERVAL_MS || 3000),
  maxWaitMs: +(process.env.MAX_WAIT_MS || 240000),   // 生图约 90-100 秒,留足余量
  submitMs: +(process.env.SUBMIT_TIMEOUT_MS || 30000),
  maxConcurrency: +(process.env.MAX_CONCURRENCY || 5),
  maxBodyBytes: +(process.env.MAX_BODY_BYTES || 1048576),
}
if (!CFG.upstream) { console.error('[fatal] 缺少环境变量 UPSTREAM_BASE'); process.exit(1) }

let running = 0
const log = (...a) => console.log(new Date().toISOString(), ...a)

/** 统一的错误响应:OpenAI 格式,且状态码非 200 —— new-api 据此退回预扣额度 */
function fail(res, status, message, code) {
  const body = JSON.stringify({ error: { message, type: 'image_shim_error', code } })
  res.writeHead(status, { 'Content-Type': 'application/json' }).end(body)
}

/** 带超时的 fetch,避免上游卡死时连接一直挂着 */
async function fetchT(url, opt, ms) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  try { return await fetch(url, { ...opt, signal: ac.signal }) }
  finally { clearTimeout(t) }
}

/**
 * 上游轮询响应有两种形态(实测一种、文档一种),这里统一成 {state, url, reason}
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
  return { state, url, reason: d?.fail_reason || d?.message || d?.error?.message || '' }
}

async function handleGenerate(req, res, auth, body) {
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
      { method: 'POST', headers: H, body: JSON.stringify(p) }, CFG.submitMs)
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
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, CFG.pollMs))
    let n
    try {
      const r = await fetchT(`${CFG.upstream}/v1/images/tasks/${encodeURIComponent(taskId)}`,
        { headers: { Authorization: auth } }, CFG.submitMs)
      if (!r.ok) {
        // 单次查询失败不立刻放弃,连续 5 次才判定失败(上游偶发抖动)
        if (++softErrors >= 5) return fail(res, 502, `任务查询持续失败 (${r.status})`, 'poll_failed')
        continue
      }
      softErrors = 0
      n = normalize(await r.json())
    } catch {
      if (++softErrors >= 5) return fail(res, 504, '任务查询超时', 'poll_timeout')
      continue
    }

    if (n.state === 'failed') {
      log(`[task] ${taskId} 失败: ${n.reason}`)
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

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return res.writeHead(200, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ ok: true, running }))
  }
  if (req.method !== 'POST' || !req.url.startsWith('/v1/images/generations')) {
    return fail(res, 404, '仅支持 POST /v1/images/generations', 'not_found')
  }
  // 只有 new-api 会调它(内网),这里仍校验一次,避免配置失误时裸奔
  const auth = req.headers['authorization'] || ''
  if (!auth.startsWith('Bearer ')) return fail(res, 401, '缺少 Authorization', 'missing_auth')
  // 并发保护:每个请求要占用 90-100 秒,不限流会被拖垮
  if (running >= CFG.maxConcurrency) return fail(res, 429, '生图任务繁忙,请稍后重试', 'too_many_requests')

  let body = '', over = false
  req.on('data', c => {
    if (over) return
    body += c
    if (body.length > CFG.maxBodyBytes) { over = true; fail(res, 413, '请求体过大', 'body_too_large'); req.destroy() }
  })
  req.on('end', async () => {
    if (over) return
    running++
    try { await handleGenerate(req, res, auth, body) }
    catch (e) { log('[error]', e?.message); if (!res.headersSent) fail(res, 500, '内部错误', 'internal_error') }
    finally { running-- }
  })
}).listen(CFG.port, '0.0.0.0', () => {
  log(`image-shim 已启动 :${CFG.port} → ${CFG.upstream}`)
  log(`轮询 ${CFG.pollMs}ms · 最长等待 ${CFG.maxWaitMs}ms · 并发上限 ${CFG.maxConcurrency}`)
})
