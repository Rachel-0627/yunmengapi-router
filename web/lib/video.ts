/**
 * 视频模型清单与售价。
 *
 * ⚠️ 与文本/生图不同:视频【按秒计费】,总价 = 每秒单价 × 请求时长。
 *    new-api 会用客户请求的 duration 去乘固定价格,所以后台「模型固定价格」
 *    那一栏填的是【每秒】售价,不是每次。
 *
 * ⚠️ 本文件会被打包进浏览器端 JS,只放最终售价,不写进货成本。
 */

// ────────────────────────────────────────────────────────────
// 视频:按【秒】计费。总价 = 每秒单价 × 请求时长
// ────────────────────────────────────────────────────────────

export type VideoModel = {
  id: string
  name: string
  vendor: string
  /** 固定输出分辨率 */
  resolution: string
  /** 每秒售价,人民币 */
  pricePerSecond: number
  /** 可选时长区间(秒) */
  minSeconds: number
  maxSeconds: number
  blurb: string
  tags: string[]
  featured?: boolean
}

export const videoModels: VideoModel[] = [
  {
    id: 'seedance-mini-2.0-480p',
    name: 'Seedance 2.0 Mini',
    vendor: '字节跳动',
    resolution: '480p',
    pricePerSecond: 0.8,
    minSeconds: 4,
    maxSeconds: 15,
    blurb: '最便宜的出片选择,适合先出草稿再决定要不要上高清',
    tags: ['文生视频', '低价'],
  },
  {
    id: 'seedance-2.0-480p',
    name: 'Seedance 2.0 480p',
    vendor: '字节跳动',
    resolution: '480p',
    pricePerSecond: 1.0,
    minSeconds: 4,
    maxSeconds: 15,
    blurb: '标准 480p,支持文生视频、图生视频与首尾帧',
    tags: ['文生视频', '图生视频'],
  },
  {
    id: 'seedance-2.0-720p',
    name: 'Seedance 2.0 720p',
    vendor: '字节跳动',
    resolution: '720p',
    pricePerSecond: 1.75,
    minSeconds: 4,
    maxSeconds: 15,
    blurb: '日常主力档,清晰度与成本平衡最好',
    tags: ['文生视频', '常用'],
    featured: true,
  },
  {
    id: 'seedance-standard-720p',
    name: 'Seedance 标准 720p',
    vendor: '字节跳动',
    resolution: '720p',
    pricePerSecond: 1.9,
    minSeconds: 4,
    maxSeconds: 15,
    blurb: '720p 标准版,出片稳定',
    tags: ['文生视频'],
  },
  {
    id: 'seedance2.5',
    name: 'Seedance 2.5',
    vendor: '字节跳动',
    resolution: '720p',
    pricePerSecond: 3.2,
    minSeconds: 4,
    maxSeconds: 30,
    blurb: '最新一代,支持多图/视频/音频参考,时长可到 30 秒',
    tags: ['文生视频', '图生视频', '旗舰'],
    featured: true,
  },
  {
    id: 'seedance-2.0-1080p',
    name: 'Seedance 2.0 1080p',
    vendor: '字节跳动',
    resolution: '1080p',
    pricePerSecond: 3.5,
    minSeconds: 4,
    maxSeconds: 15,
    blurb: '全高清输出,适合正式交付的宣传片段',
    tags: ['文生视频', '高清'],
  },
  {
    id: 'seedance-2.0-4k',
    name: 'Seedance 2.0 4K',
    vendor: '字节跳动',
    resolution: '4K',
    pricePerSecond: 6.5,
    minSeconds: 4,
    maxSeconds: 15,
    blurb: '超清输出,大屏展示与后期二次剪辑的首选',
    tags: ['文生视频', '超清'],
  },
]
