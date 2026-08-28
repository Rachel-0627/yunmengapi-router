'use client'

import { useMemo, useState } from 'react'
import { catalog, vendors, types, type ModelType } from '@/lib/catalog'

export function ModelCatalog() {
  const [type, setType] = useState<ModelType | null>(null)
  const [vendor, setVendor] = useState<string | null>(null)

  const list = useMemo(
    () =>
      catalog.filter(
        (m) => (!type || m.type === type) && (!vendor || m.vendor === vendor),
      ),
    [type, vendor],
  )

  /** 当前另一个维度已筛选时,数量要跟着变 */
  const typeCount = (t: ModelType) =>
    catalog.filter((m) => m.type === t && (!vendor || m.vendor === vendor)).length
  const vendorCount = (v: string) =>
    catalog.filter((m) => m.vendor === v && (!type || m.type === type)).length

  return (
    <div>
      <FilterRow label="模型类型">
        <Chip on={type === null} n={catalog.length} onClick={() => setType(null)}>
          所有类型
        </Chip>
        {types.map((t) => (
          <Chip key={t} on={type === t} n={typeCount(t)} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </FilterRow>

      <FilterRow label="供应商">
        <Chip on={vendor === null} n={catalog.length} onClick={() => setVendor(null)}>
          所有供应商
        </Chip>
        {vendors.map(([v]) => (
          <Chip key={v} on={vendor === v} n={vendorCount(v)} onClick={() => setVendor(v)}>
            {v}
          </Chip>
        ))}
      </FilterRow>

      <div className="mt-8 flex items-baseline justify-between">
        <span className="text-[13.5px] text-[var(--muted)]">
          共 <span className="font-semibold text-[var(--fg)]">{list.length}</span> 个模型
        </span>
        {(type || vendor) && (
          <button
            onClick={() => {
              setType(null)
              setVendor(null)
            }}
            className="text-[13px] text-[var(--c1)] hover:underline"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[600px] text-[14px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[12.5px] text-[var(--dim)]">
              <th className="py-3 pr-4 font-medium">模型</th>
              <th className="py-3 pr-4 font-medium">供应商</th>
              <th className="py-3 pr-4 text-right font-medium">输入 / 每次</th>
              <th className="py-3 text-right font-medium">输出</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)]">
                <td className="py-3 pr-4">
                  <span className="font-mono text-[13px]">{m.id}</span>
                </td>
                <td className="py-3 pr-4 text-[13px] text-[var(--muted)]">{m.vendor}</td>
                <td className="py-3 pr-4 text-right font-mono">¥{m.priceIn}</td>
                <td className="py-3 text-right font-mono">
                  {m.priceOut === null ? (
                    <span className="text-[var(--dim)]">—</span>
                  ) : (
                    <>¥{m.priceOut}</>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[var(--dim)]">
            没有符合条件的模型
          </p>
        )}
      </div>

      <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--dim)]">
        文本模型单位为人民币 / 每百万 token,输入与输出分开计价;
        图像与视频模型按次计费,「输出」列不适用。所有模型均为按量付费,无免费额度。
      </p>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <div className="mb-2.5 text-[13px] font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  on,
  n,
  onClick,
  children,
}: {
  on: boolean
  n: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
        on
          ? 'border-[var(--fg)] bg-[var(--surface-hi)] font-medium text-[var(--fg)]'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--dim)] hover:text-[var(--fg)]'
      }`}
    >
      {children}
      <span
        className={`rounded-full px-1.5 text-[11.5px] ${
          on ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--surface-hi)] text-[var(--dim)]'
        }`}
      >
        {n}
      </span>
    </button>
  )
}
