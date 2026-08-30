/**
 * image-shim —— 上游与 new-api 之间的协议翻译层
 *
 * 解决两个不兼容(都不改 new-api 源码):
 *   生图  上游只有异步接口,new-api 只支持同步  → image.js 替它跑完异步三步
 *   视频  上游返回 not_start 等状态,new-api 的 sora 适配器不认识,会把任务判成失败
 *         → video.js 把状态翻译成它认识的写法
 *
 * 链路:客户 → new-api(鉴权·计费·日志)→ 本服务 → 上游
 * 密钥:不落地,原样透传 new-api 发来的 Authorization。
 */

import http from 'node:http'
import { CFG, fail, log, readBody } from './config.js'
import { generate } from './image.js'
import * as video from './video.js'

if (!CFG.upstream) { console.error('[fatal] 缺少环境变量 UPSTREAM_BASE'); process.exit(1) }

let running = 0

/** 从 /v1/videos/xxx 或 /v1/video/generations/xxx 里取出任务号 */
function videoTaskId(pathname) {
  const m = pathname.match(/^\/v1\/(?:videos|video\/generations)\/([^/?]+)/)
  return m ? decodeURIComponent(m[1]) : ''
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const p = url.pathname

  if (req.method === 'GET' && p === '/health') {
    return res.writeHead(200, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ ok: true, running }))
  }

  // 只有 new-api 会调它(内网),这里仍校验一次,避免配置失误时裸奔
  const auth = req.headers['authorization'] || ''
  if (!auth.startsWith('Bearer ')) return fail(res, 401, '缺少 Authorization', 'missing_auth')

  // ── 视频:查询任务(轻量,不占并发额度)──
  if (req.method === 'GET') {
    const id = videoTaskId(p)
    if (id) return video.fetchTask(req, res, auth, id)
    return fail(res, 404, '不支持的路径', 'not_found')
  }

  if (req.method !== 'POST') return fail(res, 405, '不支持的方法', 'method_not_allowed')

  // ── 视频:提交任务(转发即可,不阻塞)──
  if (p === '/v1/videos' || p === '/v1/video/generations') {
    const body = await readBody(req, res)
    if (body === null) return
    return video.submit(req, res, auth, body)
  }

  // ── 生图:要阻塞等待出图,占用并发额度 ──
  if (p.startsWith('/v1/images/generations')) {
    if (running >= CFG.maxConcurrency) {
      return fail(res, 429, '生图任务繁忙,请稍后重试', 'too_many_requests')
    }
    const body = await readBody(req, res)
    if (body === null) return
    running++
    try { await generate(req, res, auth, body) }
    catch (e) {
      log('[error]', e?.message)
      if (!res.headersSent) fail(res, 500, '内部错误', 'internal_error')
    }
    finally { running-- }
    return
  }

  fail(res, 404, '仅支持 /v1/images/generations 与 /v1/videos', 'not_found')
})

server.listen(CFG.port, '0.0.0.0', () => {
  log(`image-shim 已启动 :${CFG.port} → ${CFG.upstream}`)
  log(`生图轮询 ${CFG.pollMs}ms · 最长等待 ${CFG.maxWaitMs}ms · 并发上限 ${CFG.maxConcurrency}`)
  log(`视频:转发 + 状态翻译(not_start → queued)`)
})
