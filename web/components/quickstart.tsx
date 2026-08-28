import { Section } from './section'
import { CodeTabs } from './code-tabs'
import { chatSnippets } from '@/lib/snippets'

const steps = [
  { n: '01', t: '注册账号', d: '邮箱注册即可,无需信用卡。' },
  { n: '02', t: '充值并创建 Key', d: '支付宝或微信充值,在控制台生成 API Key。' },
  { n: '03', t: '改一行 base_url', d: '把原来的官方地址换成我们的,代码其余部分不用动。' },
]

export function Quickstart() {
  return (
    <Section
      id="start"
      eyebrow="Quick Start"
      title={<>改一行代码,<span className="grad-text">五分钟接入</span></>}
      desc="完全兼容 OpenAI SDK。已有项目只需替换 base_url 和 api_key,其余代码零改动。"
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <ol className="space-y-5">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="mt-0.5 font-mono text-[13px] font-semibold text-[var(--c1)]">
                {s.n}
              </span>
              <div>
                <div className="text-[15px] font-semibold">{s.t}</div>
                <div className="mt-1 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {s.d}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <CodeTabs snippets={chatSnippets} />
      </div>
    </Section>
  )
}
