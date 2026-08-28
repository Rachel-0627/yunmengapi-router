/** 通用区块外壳:统一各段的间距和标题排版 */
export function Section({
  id,
  eyebrow,
  title,
  desc,
  children,
  className = '',
}: {
  id?: string
  eyebrow?: string
  title: React.ReactNode
  desc?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-5 py-16 sm:py-20 ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-3 font-mono text-[12.5px] uppercase tracking-widest text-[var(--c1)]">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[34px]">
          {title}
        </h2>
        {desc && (
          <p className="mt-3.5 text-[15px] leading-relaxed text-[var(--muted)]">
            {desc}
          </p>
        )}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  )
}
