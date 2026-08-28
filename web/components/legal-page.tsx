import { site } from '@/lib/site'

export type Clause = { h: string; p: string[] }

/** 法务页通用排版:标题 + 更新日期 + 编号条款 */
export function LegalPage({
  title,
  updated,
  intro,
  clauses,
}: {
  title: string
  updated: string
  intro?: string
  clauses: Clause[]
}) {
  return (
    <main className="relative">
      <div className="grid-bg opacity-40" />
      <div className="relative mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <h1 className="text-[30px] font-bold tracking-tight sm:text-[38px]">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[13px] text-[var(--dim)]">
          最后更新:{updated}
        </p>

        {intro && (
          <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-[14px] leading-relaxed text-[var(--muted)]">
            {intro}
          </p>
        )}

        <div className="mt-10 space-y-9">
          {clauses.map((c, i) => (
            <section key={c.h}>
              <h2 className="text-[17px] font-semibold">
                <span className="mr-2 font-mono text-[var(--c1)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {c.h}
              </h2>
              <div className="mt-3 space-y-3">
                {c.p.map((t, j) => (
                  <p
                    key={j}
                    className="text-[14.5px] leading-relaxed text-[var(--muted)]"
                  >
                    {t}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hairline my-12" />

        <p className="text-[13px] leading-relaxed text-[var(--dim)]">
          对本条款有疑问,请联系{' '}
          <a
            href={`mailto:${site.supportEmail}`}
            className="text-[var(--c1)] hover:underline"
          >
            {site.supportEmail}
          </a>
          。本页为{site.name}({site.domain})的正式条款,以中文版本为准。
        </p>
      </div>
    </main>
  )
}
