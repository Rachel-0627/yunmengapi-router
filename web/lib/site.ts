/**
 * 站点信息单一来源。
 * 域名/品牌/邮箱只在这里改一次,全站自动生效。
 */
export const site = {
  name: '云梦API',
  nameEn: 'YunmengAPI',
  tagline: '一个接口,接通全球顶级大模型',
  subline: '兼容 OpenAI / Claude / Gemini 三种协议,统一计费,按量付费。低至官方价一折。',

  domain: 'yunmengapi.com',
  url: 'https://yunmengapi.com',

  /**
   * API 端点走独立子域名。
   * 原因:new-api 自身占用了 / 、/pricing 、/models 、/register 等路径,
   * 与本营销站冲突,因此按子域名切分,而不是按路径。
   */
  apiBaseUrl: 'https://api.yunmengapi.com',

  /** 控制台由 new-api 提供,独立子域名 */
  consoleUrl: 'https://console.yunmengapi.com',
  registerUrl: 'https://console.yunmengapi.com/register',
  loginUrl: 'https://console.yunmengapi.com/login',

  supportEmail: 'support@yunmengapi.com',

  /**
   * 合规披露:必须显眼展示。
   * 我们是独立第三方网关,不是任何模型厂商的官方渠道,也未获其授权。
   */
  disclosure:
    '本站是独立的第三方 API 网关服务,与 Anthropic、OpenAI、Google 等模型厂商无任何隶属、授权或合作关系。' +
    '请求经由上游供应商转发,模型行为(包括系统级指令、模型对自身的描述)可能与厂商官方接口存在差异。' +
    '接入前请阅读「与官方接口的差异」一节。',
} as const

/**
 * 文本模型统一加价系数:售价 = 进货价 × MARKUP。
 *
 * 为什么用加价系数而不是"官方价打几折":
 * 中转站的进货成本结构和厂商官方定价结构完全不同 —— 官方 Opus 是 Sonnet 的 5 倍价,
 * 但号池里 Opus 只是 Sonnet 的 1.67 倍。按官方折扣定价会让 Opus 定得离谱高。
 * 用加价系数则每个模型毛利率一致,上游调价时改这一个数字即可。
 */
export const MARKUP = 2.5

/** 生图不用统一系数 —— 各分辨率档位进货成本差异太大,价格逐档写死在 models.ts */

/** 保留两位小数 */
export const round2 = (n: number) => Math.round(n * 100) / 100

/** 保留三位小数(生图单价很小) */
export const round3 = (n: number) => Math.round(n * 1000) / 1000
