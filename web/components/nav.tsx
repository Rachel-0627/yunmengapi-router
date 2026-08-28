'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { site } from '@/lib/site'

/** hash 类链接指向首页锚点,需要滚动监听才知道是否"当前所在" */
const links = [
  { href: '/#models', label: '模型', section: 'models' },
  { href: '/pricing', label: '价格' },
  { href: '/docs', label: '文档' },
  { href: '/#faq', label: '常见问题', section: 'faq' },
]

export function Nav() {
  const pathname = usePathname()
  const active = useActiveSection(pathname === '/')

  const isActive = (l: (typeof links)[number]) =>
    l.section ? active === l.section : pathname === l.href

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-5 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo />
          <span className="text-[15.5px] font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const on = isActive(l)
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? 'page' : undefined}
                className={`relative rounded-md px-3 py-1.5 text-[14.5px] transition-colors ${
                  on
                    ? 'font-medium text-[var(--fg)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface-hi)] hover:text-[var(--fg)]'
                }`}
              >
                {l.label}
                {on && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-[var(--c1)]" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={site.loginUrl}
            className="hidden rounded-md px-3 py-1.5 text-[14.5px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hi)] hover:text-[var(--fg)] sm:block"
          >
            登录
          </a>
          <a href={site.registerUrl} className="btn-primary !px-4 !py-2 !text-[14px]">
            免费注册
          </a>
        </div>
      </nav>
    </header>
  )
}

/**
 * 滚动监听:首页上哪个区块在视口里,对应导航项就高亮。
 * 只在首页启用,其他页面直接返回 null。
 */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }
    const ids = links.map((l) => l.section).filter(Boolean) as string[]
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null)
    if (nodes.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      // 顶部留出导航高度,底部收窄,避免多个区块同时命中
      { rootMargin: '-64px 0px -55% 0px', threshold: [0.1, 0.5] },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [enabled])

  return active
}

/** 品牌标记:两条汇聚的线,呼应"多模型汇聚到一个接口" */
function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="var(--c1)" />
          <stop offset="1" stopColor="var(--c2)" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#lg)" opacity=".12" />
      <path
        d="M6 7h4.5c2 0 2 5 4 5H18M6 17h4.5c2 0 2-5 4-5"
        stroke="url(#lg)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="18" cy="12" r="1.9" fill="url(#lg)" />
    </svg>
  )
}
