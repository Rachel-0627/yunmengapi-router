import Link from 'next/link'
import { site } from '@/lib/site'

const cols = [
  {
    title: '产品',
    links: [
      { href: '/#models', label: '模型列表' },
      { href: '/pricing', label: '价格' },
      { href: '/#start', label: '快速接入' },
    ],
  },
  {
    title: '资源',
    links: [
      { href: '/docs', label: '接入文档' },
      { href: '/#faq', label: '常见问题' },
      { href: site.consoleUrl, label: '控制台' },
    ],
  },
  {
    title: '条款',
    links: [
      { href: '/legal/terms', label: '服务条款' },
      { href: '/legal/privacy', label: '隐私政策' },
      { href: '/legal/refund', label: '退款政策' },
      { href: '/legal/aup', label: '使用规范' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-8 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="text-[15px] font-semibold">{site.name}</div>
            <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-[var(--dim)]">
              {site.tagline}
            </p>
            <a
              href={`mailto:${site.supportEmail}`}
              className="mt-3 inline-block font-mono text-[12.5px] text-[var(--muted)] transition-colors hover:text-[var(--c1)]"
            >
              {site.supportEmail}
            </a>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-[13px] font-semibold text-[var(--muted)]">
                {c.title}
              </div>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-[var(--dim)] transition-colors hover:text-[var(--fg)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline my-8" />

        <p className="text-[12px] leading-relaxed text-[var(--dim)]">
          © {new Date().getFullYear()} {site.name}. 保留所有权利。
          <br />
          本站为独立第三方 API 网关,与各模型厂商无隶属或授权关系。
        </p>
      </div>
    </footer>
  )
}
