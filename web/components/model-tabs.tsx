'use client'

import { useState } from 'react'
import {
  pricedTextModels,
  imageModels,
  type PricedTextModel,
  type ImageModel,
} from '@/lib/models'

const TABS = [
  { key: 'text', label: '文本模型', hint: '按 token 计费' },
  { key: 'image', label: '生图模型', hint: '按张计费' },
] as const

export function ModelTabs() {
  const [tab, setTab] = useState<'text' | 'image'>('text')

  return (
    <div>
      <div className="mb-7 inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-[13.5px] transition-colors ${
              tab === t.key
                ? 'bg-[var(--surface-hi)] font-medium text-[var(--fg)]'
                : 'text-[var(--dim)] hover:text-[var(--muted)]'
            }`}
          >
            {t.label}
            <span className="ml-2 text-[11.5px] text-[var(--dim)]">{t.hint}</span>
          </button>
        ))}
      </div>

      {tab === 'text' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricedTextModels.map((m) => (
              <TextCard key={m.id} m={m} />
            ))}
          </div>
          <p className="mt-6 text-[13px] leading-relaxed text-[var(--dim)]">
            价格按每百万 token 计,单位人民币。输入与输出分开计费,缓存命中部分另有折扣。
            对比价取自各厂商官方公开定价,按 1 USD ≈ 7.2 CNY 折算,仅供参考。
          </p>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imageModels.map((m) => (
              <ImageCard key={m.id} m={m} />
            ))}
          </div>
          <p className="mt-6 text-[13px] leading-relaxed text-[var(--dim)]">
            生图按张计费,生成失败不扣费。分辨率越高单价越贵,建议先用 1K 出草稿,满意后再出 4K。
          </p>
        </>
      )}
    </div>
  )
}

function TextCard({ m }: { m: PricedTextModel }) {
  return (
    <div className="glass glass-hover flex flex-col p-5">
      <CardHead
        name={m.name}
        vendor={m.vendor}
        badge={`省 ${m.savePercent}%`}
      />
      <p className="mt-3 min-h-[44px] text-[13.5px] leading-relaxed text-[var(--muted)]">
        {m.blurb}
      </p>
      <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
        <PriceRow label="输入" ours={m.priceIn} official={m.officialIn} />
        <PriceRow label="输出" ours={m.priceOut} official={m.officialOut} />
      </div>
      <Tags tags={m.tags} />
    </div>
  )
}

function ImageCard({ m }: { m: ImageModel }) {
  return (
    <div className="glass glass-hover flex flex-col p-5">
      <CardHead name={m.name} vendor={m.vendor} badge="按张计费" />
      <p className="mt-3 min-h-[44px] text-[13.5px] leading-relaxed text-[var(--muted)]">
        {m.blurb}
      </p>
      <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
        {m.tiers.map((t) => (
          <div key={t.label} className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[13px] font-medium">{t.label}</div>
              {t.note && (
                <div className="text-[11.5px] text-[var(--dim)]">{t.note}</div>
              )}
            </div>
            <span className="whitespace-nowrap font-mono text-[15px] font-semibold">
              ¥{t.price}
              <span className="ml-0.5 text-[11.5px] font-normal text-[var(--dim)]">
                /张
              </span>
            </span>
          </div>
        ))}
      </div>
      <Tags tags={m.tags} />
    </div>
  )
}

function CardHead({
  name,
  vendor,
  badge,
}: {
  name: string
  vendor: string
  badge: string
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="text-[15.5px] font-semibold leading-snug">{name}</div>
        <div className="mt-0.5 text-[12.5px] text-[var(--dim)]">{vendor}</div>
      </div>
      <span className="shrink-0 rounded-md border border-[var(--c1)]/30 bg-[var(--c1)]/10 px-2 py-1 text-[11.5px] font-semibold text-[var(--c1)]">
        {badge}
      </span>
    </div>
  )
}

function PriceRow({
  label,
  ours,
  official,
}: {
  label: string
  ours: number
  official: number
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12.5px] text-[var(--dim)]">{label}</span>
      <span className="flex items-baseline gap-2 font-mono">
        <s className="text-[12px] text-[var(--dim)]">¥{official}</s>
        <span className="text-[15px] font-semibold text-[var(--fg)]">¥{ours}</span>
      </span>
    </div>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[11px] text-[var(--dim)]"
        >
          {t}
        </span>
      ))}
    </div>
  )
}
