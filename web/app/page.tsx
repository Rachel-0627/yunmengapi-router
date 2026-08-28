import { Hero } from '@/components/hero'
import { ModelCards } from '@/components/model-cards'
import { Quickstart } from '@/components/quickstart'
import { Clients } from '@/components/clients'
import { Faq } from '@/components/faq'
import { site } from '@/lib/site'

export default function Home() {
  return (
    <main>
        <Hero />
        <ModelCards />
        <Quickstart />
        <Clients />
        <Faq />
        <Cta />
    </main>
  )
}

function Cta() {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-5 py-16">
      <div className="glass relative overflow-hidden !rounded-2xl px-6 py-14 text-center sm:px-12">
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-64 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(217,85,26,.10), transparent 68%)',
            filter: 'blur(38px)',
          }}
        />
        <div className="relative">
          <h2 className="text-[26px] font-bold tracking-tight sm:text-[32px]">
            现在就把 <span className="grad-text">base_url</span> 改掉
          </h2>
          <p className="mx-auto mt-3.5 max-w-md text-[14.5px] leading-relaxed text-[var(--muted)]">
            注册即可创建 Key,充值实时到账,按量计费,随时停用。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={site.registerUrl} className="btn-primary">
              免费注册
            </a>
            <a href="/docs" className="btn-ghost">
              查看文档
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
