import { site } from '@/lib/site'
import { Section } from './section'

const diffs = [
  {
    t: '我们不是官方渠道',
    d: '本站与 Anthropic、OpenAI、Google 等厂商没有任何隶属、授权或合作关系。你的请求由我们转发给上游供应商,再返回给你。',
  },
  {
    t: '模型的自我描述可能不同',
    d: '经由中转的请求,模型对"我是谁""我的版本"这类问题的回答,可能与厂商官方接口不一致。这是链路特性,不影响正常的编码与问答能力。',
  },
  {
    t: '可能存在系统提示词注入',
    d: '上游链路可能在你的请求前附加系统级指令。我们已实测:这会影响模型的措辞风格,但不影响函数调用(tool use)的正确性。',
  },
  {
    t: '稳定性依赖上游',
    d: '我们做了多渠道自动故障转移,但极端情况下仍可能出现上游波动。介意服务连续性的生产业务,建议同时保留官方渠道作为兜底。',
  },
]

export function Disclosure() {
  return (
    <Section
      id="differences"
      eyebrow="Be Honest"
      title={<>与官方接口的<span className="grad-text">差异</span></>}
      desc="便宜是有原因的。下面这些话我们写在明处,你接入前就该知道,而不是用出问题才发现。"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {diffs.map((x) => (
          <div key={x.t} className="glass p-5">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--warn)]" />
              <div>
                <div className="text-[14.5px] font-semibold">{x.t}</div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {x.d}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px] leading-relaxed text-[var(--dim)]">
        {site.disclosure}
      </p>
    </Section>
  )
}
