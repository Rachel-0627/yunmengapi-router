import { Section } from './section'

const faqs = [
  {
    q: '为什么能比官方便宜这么多?',
    a: '我们从上游批量采购额度,以规模价拿货,再加价转售。不同模型的采购成本不一样,所以折扣力度也不同——Opus 最高能省 90%,Haiku 约 62%。差价来自采购规模,不是降低模型质量,你调用的是同一批模型。',
  },
  {
    q: '充值的钱会过期吗?有最低消费吗?',
    a: '额度长期有效,不过期,也没有月费或最低消费。充多少用多少,不设赠送,不搞满减套路。',
  },
  {
    q: '生图是怎么计费的?',
    a: '按张计费,不按 token。1K 每张 ¥0.05,4K 每张 ¥0.145。生成失败不扣费。建议先用 1K 出草稿,满意后再出 4K,能省不少。',
  },
  {
    q: '支持哪些付款方式?',
    a: '支持支付宝和微信支付,充值后额度实时到账。',
  },
  {
    q: '和官方接口的返回结果一样吗?',
    a: '模型能力一致,但链路上可能存在系统提示词注入,会影响模型的措辞风格和自我描述,不影响函数调用的正确性。',
  },
  {
    q: '我的对话内容会被保存吗?',
    a: '我们记录调用时间、模型名称和 token 用量用于计费和排障,不留存你的对话正文。日志中也不会出现你的 API Key。',
  },
  {
    q: '接口不稳定怎么办?',
    a: '我们采用稳定的上游渠道并持续监测健康状况。但如果你的业务对连续性要求极高,建议同时保留官方渠道作为兜底。',
  },
  {
    q: '可以退款吗?',
    a: '未消费的额度支持退款,按实际未使用金额原路退回。已消费部分不予退还。具体以退款条款为准。',
  },
]

export function Faq() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title={<>常见<span className="grad-text">问题</span></>}
    >
      <div className="space-y-2.5">
        {faqs.map((f) => (
          <details key={f.q} className="glass group px-5 py-4 [&[open]]:bg-[var(--surface-hi)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-medium marker:hidden">
              {f.q}
              <span className="shrink-0 text-[var(--dim)] transition-transform duration-200 group-open:rotate-45">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  )
}
