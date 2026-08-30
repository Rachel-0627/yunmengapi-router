import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { ModelCatalog } from '@/components/model-catalog'
import { PricingSections } from '@/components/pricing-sections'
import { catalog } from '@/lib/catalog'

export const metadata: Metadata = {
  title: '价格',
  description: '按量计费,充多少用多少。文本按 token,生图按张,视频按秒。无月费,无最低消费。',
}

export default function Page() {
  return (
    <main className="relative">
      <div className="grid-bg opacity-40" />
      <div className="relative mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <h1 className="text-[30px] font-bold tracking-tight sm:text-[40px]">
          价格<span className="grad-text">透明</span>,按量计费
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[var(--muted)]">
          充多少用多少,额度不过期。没有月费,没有最低消费,
          <span className="font-medium text-[var(--fg)]">也没有任何充值赠送</span>
          ——我们把让利直接做进单价里。
        </p>

        <PricingSections />

        {/* 全量模型目录 */}
        <h2 className="mt-16 text-[20px] font-semibold">全部模型</h2>
        <p className="mt-2 text-[13.5px] text-[var(--dim)]">
          共 {catalog.length} 个模型,按类型或供应商筛选
        </p>
        <div className="mt-6">
          <ModelCatalog />
        </div>

        {/* 计费说明 */}
        <h2 className="mt-14 text-[20px] font-semibold">计费说明</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { t: '输入输出分开计价', d: '输出价通常是输入价的 5 倍,这和厂商官方的计价方式一致。' },
            { t: '缓存命中更便宜', d: '重复的上下文命中缓存后,这部分按更低的费率计费。长对话和编码场景省得最明显。' },
            { t: '实时扣费', d: '每次请求结束立即结算,控制台能看到每一条调用的明细和花费。' },
            { t: '额度不过期', d: '充值的额度长期有效,不设过期时间,也不会因为长期不用而清零。' },
            { t: '生图失败不扣费', d: '内容审核拒绝、上游超时导致的失败,不扣额度。' },
            { t: '4K 是原生直出', d: '4K 档按 3840×2160 原生渲染,可直接用于印刷和大屏展示。' },
            { t: '视频按秒结算', d: '总价 = 每秒单价 × 实际生成时长。请求时用 duration 指定秒数,不填默认 4 秒。' },
            { t: '支付宝 / 微信充值', d: '充值实时到账,无需信用卡,无需绑定境外支付方式。' },
          ].map((x) => (
            <div key={x.t} className="glass p-5">
              <div className="text-[14.5px] font-semibold">{x.t}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
                {x.d}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px] leading-relaxed text-[var(--dim)]">
          对比价格取自各模型厂商官方公开定价,按 1 USD ≈ 7.2 CNY 折算,仅供参考。
          厂商调价或汇率变动时,本页价格可能同步调整,以本页公示为准。
          未消费额度支持退款,详见{' '}
          <a href="/legal/refund" className="text-[var(--c1)] hover:underline">
            退款政策
          </a>
          。
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href={site.registerUrl} className="btn-primary">
            注册并充值
          </a>
          <a href="/docs" className="btn-ghost">
            查看接入文档
          </a>
        </div>
      </div>
    </main>
  )
}
