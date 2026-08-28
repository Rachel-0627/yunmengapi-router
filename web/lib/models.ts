/**
 * 模型清单与售价。
 *
 * ⚠️ 本文件会被打包进浏览器端 JS,任何人都能看到。
 *    因此这里【只放最终售价和官方公开价】,绝不写进货成本和毛利率。
 *    成本测算见 docs/定价成本.md(不参与打包)。
 *
 * 官方价按 1 USD ≈ 7.2 CNY 折算,单位:人民币 / 每百万 token。
 */

export type TextModel = {
  id: string
  name: string
  vendor: string
  blurb: string
  /** 我们的售价 */
  priceIn: number
  priceOut: number
  /** 厂商官方公开价,用于对比展示 */
  officialIn: number
  officialOut: number
  tags: string[]
  featured?: boolean
}

export const textModels: TextModel[] = [
  {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    vendor: 'Anthropic',
    blurb: '最强推理与长程编码,复杂重构、架构设计首选',
    priceIn: 11.0,
    priceOut: 55.0,
    officialIn: 108,
    officialOut: 540,
    tags: ['编码', '推理', '旗舰'],
    featured: true,
  },
  {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    vendor: 'Anthropic',
    blurb: '日常编码主力,速度与质量平衡最好,性价比之王',
    priceIn: 4.4,
    priceOut: 22.0,
    officialIn: 21.6,
    officialOut: 108,
    tags: ['编码', '均衡', '常用'],
    featured: true,
  },
  {
    id: 'claude-fable-5',
    name: 'Claude Fable 5',
    vendor: 'Anthropic',
    blurb: '自带深度思考,擅长长文写作与方案推演',
    priceIn: 41.25,
    priceOut: 206.25,
    officialIn: 72,
    officialOut: 360,
    tags: ['写作', '思考'],
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    vendor: 'Anthropic',
    blurb: '最快最省,适合批量处理、分类、简单补全',
    priceIn: 2.2,
    priceOut: 11.0,
    officialIn: 5.76,
    officialOut: 28.8,
    tags: ['极速', '低价'],
    featured: true,
  },
]

/** 附上"比官方省百分之多少",输入与输出比例一致,取输入即可 */
export const pricedTextModels = textModels.map((m) => ({
  ...m,
  savePercent: Math.round((1 - m.priceIn / m.officialIn) * 100),
}))

export type PricedTextModel = (typeof pricedTextModels)[number]

// ────────────────────────────────────────────────────────────
// 生图:按张计费,不按 token
// ────────────────────────────────────────────────────────────

export type ImageTier = {
  /** 分辨率档位 */
  label: string
  /** 每张售价,人民币 */
  price: number
  note?: string
}

export type ImageModel = {
  id: string
  name: string
  vendor: string
  blurb: string
  tiers: ImageTier[]
  tags: string[]
  featured?: boolean
}

export const imageModels: ImageModel[] = [
  {
    id: 'gpt-image-2',
    name: 'GPT Image 2',
    vendor: 'OpenAI',
    blurb: '文生图与图生图,指令遵循准确,适合海报、配图、电商图',
    tiers: [
      { label: '1K', price: 0.05, note: '1024px,日常出图' },
      { label: '4K', price: 0.145, note: '高分辨率,可直接印刷' },
    ],
    tags: ['文生图', '图生图'],
    featured: true,
  },
]

/** 全站最低单张价格,用于文案展示 */
export const minImagePrice = Math.min(
  ...imageModels.flatMap((m) => m.tiers.map((t) => t.price)),
)
