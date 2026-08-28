'use client'

import { useState } from 'react'

export type Snippet = { label: string; lang: string; code: string }

export function CodeTabs({ snippets }: { snippets: Snippet[] }) {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const current = snippets[active]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // 剪贴板不可用(非 HTTPS 或用户拒绝),静默降级,用户可手动选中复制
    }
  }

  return (
    <div className="glass overflow-hidden">
      <div className="flex items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] px-2">
        {snippets.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={`relative px-3.5 py-2.5 text-[13px] transition-colors ${
              i === active
                ? 'text-[var(--fg)]'
                : 'text-[var(--dim)] hover:text-[var(--muted)]'
            }`}
          >
            {s.label}
            {i === active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--c1)]" />
            )}
          </button>
        ))}

        <button
          onClick={copy}
          className="ml-auto mr-1 rounded-md border border-[var(--border)] px-2.5 py-1 text-[12px] text-[var(--muted)] transition-colors hover:border-[var(--c1)] hover:text-[var(--fg)]"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      <pre className="overflow-x-auto bg-[var(--bg-soft)] p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[var(--fg)]">{current.code}</code>
      </pre>
    </div>
  )
}
