/**
 * 视频:状态值翻译层。
 *
 * 为什么需要:
 *   上游轮询会返回 not_start / running 这些状态,而 new-api 的 sora 适配器
 *   只认 queued / pending / processing / in_progress / completed / failed / cancelled
 *   (relay/channel/task/sora/adaptor.go:299-313)。撞上不认识的值就落到 default 分支,
 *   task_polling.go:517 直接把任务判成 "upstream returned unrecognized message" 失败。
 *
 *   实测:提交 24 秒后任务被误杀,而上游那边照常出片、照常扣钱。
 *
 * 做什么:
 *   原样转发请求与响应,只把 status 换成 new-api 认识的写法。其余字段一律不动。
 */

import { CFG, fail, fetchT, log } from './config.js'

/** 上游状态 → new-api 能识别的状态。未知的一律当"还在排队",让它继续轮询而不是判死 */
const MAP = {
  not_start: 'queued',
  notstart: 'queued',
  queued: 'queued',
  pending: 'queued',
  submitted: 'queued',
  running: 'in_progress',
  processing: 'in_progress',
  in_progress: 'in_progress',
  completed: 'completed',
  success: 'completed',
  succeeded: 'completed',
  finished: 'completed',
  failed: 'failed',
  failure: 'failed',
  error: 'failed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
}

function normalizeStatus(raw) {
  const s = String(raw ?? '').trim().toLowerCase()
  if (!s) return 'queued'
  return MAP[s] ?? 'queued'   // 未知状态保守处理:继续等,别判失败
}

/** POST /v1/videos —— 提交任务,原样转发 */
export async function submit(req, res, auth, body) {
  try {
    const r = await fetchT(`${CFG.upstream}/v1/videos`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: auth }, body },
      CFG.reqMs)
    const txt = await r.text()
    let j; try { j = JSON.parse(txt) } catch { j = null }
    if (r.status !== 200 || !j) {
      log(`[video:submit] 上游 ${r.status}`)
      return fail(res, r.status === 200 ? 502 : r.status,
        j?.error?.message || `上游返回 ${r.status}`, 'upstream_error')
    }
    if (j.status) j.status = normalizeStatus(j.status)
    log(`[video:submit] task=${j.task_id || j.id} seconds=${j.seconds ?? '-'}`)
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(j))
  } catch (e) {
    log(`[video:submit] 异常 ${e.name}`)
    fail(res, 504, e.name === 'AbortError' ? '提交任务超时' : '无法连接上游', 'submit_failed')
  }
}

/** GET /v1/videos/{id} —— 查询任务,翻译状态后原样返回 */
export async function fetchTask(req, res, auth, taskId) {
  try {
    const r = await fetchT(`${CFG.upstream}/v1/videos/${encodeURIComponent(taskId)}`,
      { headers: { Authorization: auth } }, CFG.reqMs)
    const txt = await r.text()
    let j; try { j = JSON.parse(txt) } catch { j = null }
    if (!r.ok || !j) {
      return fail(res, r.ok ? 502 : r.status,
        j?.error?.message || `任务查询失败 (${r.status})`, 'fetch_failed')
    }
    const before = j.status
    j.status = normalizeStatus(before)
    if (before !== j.status) log(`[video:fetch] ${taskId} ${before} → ${j.status}`)
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(j))
  } catch (e) {
    fail(res, 504, '任务查询超时', 'fetch_timeout')
  }
}
