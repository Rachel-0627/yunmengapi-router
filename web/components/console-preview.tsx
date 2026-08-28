/**
 * 控制台界面预览。
 * 注意:这里的数字全部是「示意值」,不是真实运营数据。
 * 卡片右上角有明确标注,不得移除。
 */

const TREND = [18, 26, 22, 34, 30, 45, 41, 58, 52, 70, 64, 82]

const USAGE = [
  { name: 'Claude Sonnet 5', pct: 54, color: 'var(--c1)' },
  { name: 'Claude Opus 5', pct: 28, color: 'var(--c2)' },
  { name: 'Claude Haiku 4.5', pct: 18, color: 'var(--c3)' },
]

export function ConsolePreview() {
  return (
    <div className="glass mx-auto max-w-5xl overflow-hidden !rounded-2xl shadow-[var(--shadow-md)]">
      {/* 窗口标题栏 */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]/70" />
        <span className="size-2.5 rounded-full bg-[#febc2e]/70" />
        <span className="size-2.5 rounded-full bg-[#28c840]/70" />
        <span className="ml-3 font-mono text-[12.5px] text-[var(--dim)]">
          控制台 / 用量总览
        </span>
        <span className="badge ml-auto !py-0.5 !text-[11px] !text-[var(--dim)]">
          界面预览
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_1.5fr]">
        {/* 左:余额 + 趋势 */}
        <div className="space-y-5">
          <div>
            <div className="text-[12.5px] text-[var(--dim)]">账户余额</div>
            <div className="mt-1 font-mono text-[30px] font-semibold leading-none tracking-tight">
              ¥<span className="grad-text">128.40</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-[var(--muted)]">
              <span className="text-[var(--ok)]">↓ 12.6%</span>
              <span>较上周消耗下降</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12.5px] text-[var(--dim)]">近 12 天消耗</span>
              <span className="font-mono text-[12.5px] text-[var(--muted)]">
                ¥46.12
              </span>
            </div>
            <Sparkline />
          </div>
        </div>

        {/* 右:模型分布 + 请求统计 */}
        <div className="space-y-5">
          <div>
            <div className="mb-3 text-[12.5px] text-[var(--dim)]">模型调用占比</div>
            <div className="space-y-3">
              {USAGE.map((u) => (
                <div key={u.name}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="text-[var(--muted)]">{u.name}</span>
                    <span className="font-mono text-[var(--fg)]">{u.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-hi)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${u.pct}%`,
                        background: u.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
            <Stat label="今日请求" value="1,284" />
            <Stat label="成功率" value="99.9%" tone="ok" />
            <Stat label="平均延迟" value="0.8s" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'ok'
}) {
  return (
    <div>
      <div className="text-[11.5px] text-[var(--dim)]">{label}</div>
      <div
        className="mt-0.5 font-mono text-[17px] font-semibold"
        style={tone === 'ok' ? { color: 'var(--ok)' } : undefined}
      >
        {value}
      </div>
    </div>
  )
}

/** 纯 SVG 折线图,零依赖 */
function Sparkline() {
  const w = 320
  const h = 72
  const max = Math.max(...TREND)
  const step = w / (TREND.length - 1)
  const pts = TREND.map((v, i) => [i * step, h - (v / max) * (h - 8) - 4])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--c1)" stopOpacity=".32" />
          <stop offset="1" stopColor="var(--c1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path
        d={line}
        fill="none"
        stroke="var(--c1)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill="var(--c1)" />
    </svg>
  )
}
