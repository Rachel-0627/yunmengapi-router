/** 共用配置与工具函数。密钥不落地,全程透传 new-api 发来的 Authorization。 */

export const CFG = {
  port: +(process.env.PORT || 8080),
  upstream: (process.env.UPSTREAM_BASE || '').replace(/\/+$/, ''),
  pollMs: +(process.env.POLL_INTERVAL_MS || 3000),
  maxWaitMs: +(process.env.MAX_WAIT_MS || 240000),   // 生图约 40 秒,留足余量
  reqMs: +(process.env.SUBMIT_TIMEOUT_MS || 30000),
  maxConcurrency: +(process.env.MAX_CONCURRENCY || 5),
  maxBodyBytes: +(process.env.MAX_BODY_BYTES || 1048576),
}

export const log = (...a) => console.log(new Date().toISOString(), ...a)

/** 统一错误响应:OpenAI 格式 + 非 200 状态码,new-api 据此退回预扣额度 */
export function fail(res, status, message, code) {
  const body = JSON.stringify({ error: { message, type: 'image_shim_error', code } })
  res.writeHead(status, { 'Content-Type': 'application/json' }).end(body)
}

export function ok(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(obj))
}

/** 带超时的 fetch,避免上游卡死时连接一直挂着 */
export async function fetchT(url, opt, ms) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  try { return await fetch(url, { ...opt, signal: ac.signal }) }
  finally { clearTimeout(t) }
}

export function readBody(req, res) {
  return new Promise((resolve) => {
    let body = '', over = false
    req.on('data', (c) => {
      if (over) return
      body += c
      if (body.length > CFG.maxBodyBytes) {
        over = true
        fail(res, 413, '请求体过大', 'body_too_large')
        req.destroy()
        resolve(null)
      }
    })
    req.on('end', () => { if (!over) resolve(body) })
  })
}
