import { site } from '@/lib/site'
import { ConsolePreview } from './console-preview'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg" />
      <div className="glow-top" />

      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-14 sm:pt-28">
        <div className="rise flex flex-col items-center text-center">
          <span className="badge">
            <span className="size-1.5 rounded-full bg-[var(--ok)]" />
            已接入 Claude Opus 5 · Sonnet 5 · GPT Image 2
          </span>

          <h1 className="mt-6 max-w-3xl text-[34px] font-bold leading-[1.25] tracking-tight sm:text-[52px] sm:leading-[1.15]">
            一个接口,
            <br className="sm:hidden" />
            <span className="grad-text">接通全球顶级大模型</span>
          </h1>

          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-[var(--muted)] sm:text-[17px]">
            文本 + 生图,一个 Key 全部打通,兼容 OpenAI / Claude / Gemini 协议。
            <br className="hidden sm:block" />
            按 token 实时计费,充多少用多少,
            <span className="font-semibold text-[var(--fg)]">
              低至官方价一折
            </span>
            。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={site.registerUrl} className="btn-primary">
              立即注册使用
              <Arrow />
            </a>
            <a href="/docs" className="btn-ghost">查看接入文档</a>
          </div>

          <p className="mt-5 text-[13px] text-[var(--dim)]">
            充多少用多少,不设赠送 · 支付宝/微信充值 · 5 分钟接入
          </p>
        </div>

        <div className="rise mt-14 [animation-delay:.12s] sm:mt-16">
          <ConsolePreview />
        </div>
      </div>
    </section>
  )
}

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8h10m0 0-3.8-3.8M13 8l-3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
