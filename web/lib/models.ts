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

// 注意:1K 与 4K 是【两个独立的模型名】,不是同一模型的参数档位。
// 客户必须按 id 调用,传 size 参数不会改变计费档位。
export const imageModels: ImageModel[] = [
  {
    id: 'gpt-image2-1k',
    name: 'GPT Image 2 · 1K',
    vendor: 'OpenAI',
    blurb: '文生图与图生图,指令遵循准确,适合海报、配图、电商图',
    tiers: [{ label: '1024×1024', price: 0.05, note: '日常出图,仅支持 1K' }],
    tags: ['文生图', '图生图'],
    featured: true,
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana Pro',
    vendor: 'Google',
    blurb: '高分辨率直出,单张最高 5504×3072、300 DPI,可直接用于印刷与大屏',
    tiers: [
      { label: '5504×3072', price: 0.23, note: '调用时须传 quality="4K"' },
    ],
    tags: ['文生图', '高分辨率'],
    featured: true,
  },
  {
    id: 'gpt-image2-4k',
    name: 'GPT Image 2 · 4K',
    vendor: 'OpenAI',
    blurb: '原生 3840×2160 直出,细节足以直接印刷或上大屏',
    tiers: [
      { label: '3840×2160', price: 0.26, note: '调用时须传 size="3840x2160"' },
    ],
    tags: ['文生图', '真 4K'],
  },
]

/** 全站最低单张价格,用于文案展示 */
export const minImagePrice = Math.min(
  ...imageModels.flatMap((m) => m.tiers.map((t) => t.price)),
)
