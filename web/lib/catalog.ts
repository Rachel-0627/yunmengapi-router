/**
 * 全量模型目录 —— 由上游价目表生成,售价 = 进货价 × 2.5(毛利 60%)。
 *
 * ⚠️ 本文件会打包进浏览器,只放售价,不放进货成本。
 *    成本与毛利见 docs/定价成本.md(不参与打包)。
 *
 * ⚠️ 已剔除上游免费提供的模型 —— 站上不放任何可被薅羊毛的产品。
 *
 * 元组格式:[模型ID, 供应商, 类型, 输入价, 输出价]
 *   文本类:输入/输出 = 人民币 / 每百万 token
 *   图像与视频类:输入价 = 人民币 / 每次,输出价为 null
 */

export type ModelType = '文本' | '图像' | '视频'

type Row = [string, string, ModelType, number, number | null]

const RAW: Row[] = [
  ['claude-fable-5', 'Anthropic', '文本', 41.25, 206.25],
  ['claude-opus-4-8', 'Anthropic', '文本', 11.0, 55.0],
  ['claude-opus-4-5-20251101', 'Anthropic', '文本', 11.0, 55.0],
  ['claude-opus-4-6', 'Anthropic', '文本', 11.0, 55.0],
  ['claude-opus-4-7', 'Anthropic', '文本', 11.0, 55.0],
  ['claude-opus-5', 'Anthropic', '文本', 11.0, 55.0],
  ['claude-sonnet-4-6', 'Anthropic', '文本', 6.6, 33.0],
  ['claude-haiku-4-5', 'Anthropic', '文本', 5.5, 27.5],
  ['claude-sonnet-5', 'Anthropic', '文本', 4.4, 22.0],
  ['claude-haiku-4-5-20251001', 'Anthropic', '文本', 2.2, 11.0],
  ['deepseek-v4-pro', 'DeepSeek', '文本', 3.516, 10.547],
  ['deepseek-v3.2', 'DeepSeek', '文本', 0.787, 1.181],
  ['deepseek-v4-flash', 'DeepSeek', '文本', 0.781, 2.344],
  ['deepseek-v4-flash-preview', 'DeepSeek', '文本', 0.394, 0.787],
  ['gemini-3.5-flash', 'Google', '文本', 5.5, 33.0],
  ['gemini-3.6-flash', 'Google', '文本', 2.723, 13.613],
  ['gemini-3.1-pro-preview', 'Google', '文本', 2.2, 13.2],
  ['gemini-2.5-pro', 'Google', '文本', 1.375, 11.0],
  ['gemini-3-flash-preview', 'Google', '文本', 0.55, 3.3],
  ['gemini-3-flash', 'Google', '文本', 0.55, 3.3],
  ['gemini-3.1-flash-lite-preview', 'Google', '文本', 0.44, 2.75],
  ['gemini-2.5-flash', 'Google', '文本', 0.33, 2.75],
  ['gemini-3.1-flash-lite', 'Google', '文本', 0.275, 1.65],
  ['minimax-m2.5', 'MiniMax', '文本', 1.687, 6.75],
  ['minimax-m2.7', 'MiniMax', '文本', 1.687, 6.75],
  ['minimax-m3', 'MiniMax', '文本', 0.844, 3.375],
  ['gpt-5.6-sol', 'OpenAI', '文本', 1.237, 7.425],
  ['gpt-5.5', 'OpenAI', '文本', 1.237, 9.9],
  ['gpt-5.4', 'OpenAI', '文本', 0.619, 3.712],
  ['gpt-5.6-terra', 'OpenAI', '文本', 0.619, 3.712],
  ['gpt-5.6-luna', 'OpenAI', '文本', 0.247, 1.485],
  ['gpt-5.4-mini', 'OpenAI', '文本', 0.206, 1.238],
  ['grok-4.20-0309-reasoning', 'xAI', '文本', 6.25, 12.5],
  ['grok-4.20-0309-non-reasoning', 'xAI', '文本', 6.25, 12.5],
  ['grok-4.20-multi-agent-0309', 'xAI', '文本', 6.25, 12.5],
  ['grok-4.3', 'xAI', '文本', 6.25, 12.5],
  ['grok-4.6', 'xAI', '文本', 5.0, 15.0],
  ['grok-build-0.1', 'xAI', '文本', 5.0, 10.0],
  ['grok-4.5', 'xAI', '文本', 1.1, 3.3],
  ['mimo-v2.5', '小米', '文本', 7.7, 38.5],
  ['mimo-v2.5-pro', '小米', '文本', 1.5, 6.0],
  ['glm-5.2', '智谱AI', '文本', 6.413, 22.5],
  ['glm-5.1', '智谱AI', '文本', 6.413, 22.5],
  ['glm-5.3', '智谱AI', '文本', 6.413, 22.5],
  ['glm-5', '智谱AI', '文本', 6.413, 22.5],
  ['kimi-k3', '月之暗面', '文本', 16.875, 84.375],
  ['kimi-k2.6', '月之暗面', '文本', 5.344, 21.713],
  ['kimi-k2.7-code', '月之暗面', '文本', 5.344, 21.713],
  ['kimi-k2.5', '月之暗面', '文本', 3.206, 16.875],
  ['qwen3.8-max', '阿里云', '文本', 14.062, 42.188],
  ['qwen3.7-max', '阿里云', '文本', 9.375, 28.125],
  ['qwen3.6-plus', '阿里云', '文本', 2.925, 17.55],
  ['qwen3.5-plus', '阿里云', '文本', 1.575, 9.45],
  ['qwen3.5:397b', '阿里云', '文本', 0.637, 3.863],
  ['gemini-3-pro-image-preview', 'Google', '图像', 0.225, null],
  ['gemini-3.1-flash-image-preview', 'Google', '图像', 0.225, null],
  ['gpt-image-2', 'OpenAI', '图像', 0.0508, null],
  ['grok-imagine-image-quality', 'xAI', '图像', 0.25, null],
  ['grok-imagine-image-2.0', 'xAI', '图像', 0.2, null],
  ['grok-imagine-image', 'xAI', '图像', 0.11, null],
  ['qwen-image-2.0', '阿里云', '图像', 0.0806, null],
  ['wan2.7-image', '阿里云', '图像', 0.0806, null],
  ['minimax-h3', 'MiniMax', '视频', 2.5, null],
  ['grok-imagine-video', 'xAI', '视频', 1.0, null],
  ['grok-imagine-video-1.5', 'xAI', '视频', 1.0, null],
  ['grok-imagine-video-1.5-preview', 'xAI', '视频', 1.0, null],
  ['seedance-2.0-4k', '字节跳动', '视频', 6.5, null],
  ['seedance-2.0-1080p', '字节跳动', '视频', 3.5, null],
  ['seedance-standard-720p', '字节跳动', '视频', 1.875, null],
  ['seedance-2.0-720p', '字节跳动', '视频', 1.75, null],
  ['seedance-2.0-480p', '字节跳动', '视频', 1.0, null],
  ['seedance-mini-2.0-480p', '字节跳动', '视频', 0.8, null],
]

export type CatalogItem = {
  id: string
  vendor: string
  type: ModelType
  priceIn: number
  priceOut: number | null
}

export const catalog: CatalogItem[] = RAW.map(([id, vendor, type, priceIn, priceOut]) => ({
  id,
  vendor,
  type,
  priceIn,
  priceOut,
}))

/** 供应商列表,按模型数量倒序 */
export const vendors = Object.entries(
  catalog.reduce<Record<string, number>>((acc, m) => {
    acc[m.vendor] = (acc[m.vendor] ?? 0) + 1
    return acc
  }, {}),
).sort((a, b) => b[1] - a[1])

/** 类型列表,固定顺序 */
export const types: ModelType[] = ['文本', '图像', '视频']
