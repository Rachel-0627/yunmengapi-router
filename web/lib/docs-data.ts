/** 接入文档页的静态数据:客户端配置、厂商差异、错误码。与页面结构分开,页面只管排版。 */

export const clients = [
  { n: 'Claude Code', d: '设置环境变量 ANTHROPIC_BASE_URL 指向本站,ANTHROPIC_AUTH_TOKEN 填你的 Key。' },
  { n: 'Cherry Studio', d: '设置 → 模型服务 → 添加提供商 → 选 OpenAI 兼容 → 填入 API 地址和 Key。' },
  { n: 'Cline / Roo Code', d: 'API Provider 选 OpenAI Compatible,Base URL 和 API Key 按下方填。' },
  { n: 'LobeChat / NextChat', d: '在设置里把 OpenAI 接口地址改成本站地址即可。' },
]

export const vendors = [
  {
    n: 'Anthropic · Claude',
    m: 'claude-opus-5 / sonnet-5 / haiku-4-5 / fable-5',
    d: '长上下文与复杂编码最强,指令遵循严谨。缓存命中后输入价大幅下降,长对话和代码库场景最划算。',
  },
  {
    n: 'OpenAI · GPT',
    m: 'gpt-5.4 / 5.4-mini / 5.5 / 5.6-sol / 5.6-terra',
    d: '通用能力均衡,生态与工具链最成熟。mini 系列适合批量分类、摘要这类高频低难度任务。',
  },
  {
    n: 'OpenAI · 图像',
    m: 'gpt-image2-1k / gpt-image2-4k',
    d: '文生图与图生图,指令遵循准确。1K 适合草稿与配图,4K 为原生 3840×2160,可直接印刷。',
  },
  {
    n: 'Google · 图像',
    m: 'gemini-3-pro-image-preview',
    d: '高分辨率直出,单张最高 5504×3072、300 DPI。传 quality="4K" 与 size(画幅)取高清结果。',
  },
  {
    n: '字节跳动 · 视频',
    m: 'seedance 系列共 7 个',
    d: '480p 到 4K 全覆盖,按秒计费。2.0 系列支持 4–15 秒,seedance2.5 支持到 30 秒并可用多图/视频/音频参考。',
  },
]

export const errors = [
  ['401', '认证失败', 'Key 错误、已吊销,或请求头格式不对'],
  ['402', '额度不足', '账户余额用完了,去控制台充值'],
  ['404', '模型不存在', '模型名拼写错误,或该模型未在你的分组开放'],
  ['429', '请求过快', '触发限流,降低并发或稍后重试'],
  ['500', '上游异常', '上游波动,通常会自动切换渠道,建议重试'],
  ['503', '暂时不可用', '所有渠道都不可用,请稍后再试'],
]
