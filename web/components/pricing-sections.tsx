import { pricedTextModels, imageModels } from '@/lib/models'
import { videoModels } from '@/lib/video'

/** 定价页的三张价目表:文本按 token、生图按张、视频按秒。页面只负责串起来。 */
export function PricingSections() {
  return (
    <>
      {/* 文本模型 */}
      <h2 className="mt-14 text-[20px] font-semibold">主力模型</h2>
      <p className="mt-2 text-[13.5px] text-[var(--dim)]">
        单位:人民币 / 每百万 token
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-[14px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[12.5px] text-[var(--dim)]">
              <th className="py-3 pr-4 font-medium">模型</th>
              <th className="py-3 pr-4 text-right font-medium">输入</th>
              <th className="py-3 pr-4 text-right font-medium">输出</th>
              <th className="py-3 pr-4 text-right font-medium">官方价</th>
              <th className="py-3 text-right font-medium">节省</th>
            </tr>
          </thead>
          <tbody>
            {pricedTextModels.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)]">
                <td className="py-4 pr-4">
                  <div className="font-medium">{m.name}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-[var(--dim)]">
                    {m.id}
                  </div>
                </td>
                <td className="py-4 pr-4 text-right font-mono font-semibold">
                  ¥{m.priceIn}
                </td>
                <td className="py-4 pr-4 text-right font-mono font-semibold">
                  ¥{m.priceOut}
                </td>
                <td className="py-4 pr-4 text-right font-mono text-[13px] text-[var(--dim)]">
                  ¥{m.officialIn} / ¥{m.officialOut}
                </td>
                <td className="py-4 text-right">
                  <span className="rounded-md border border-[var(--c1)]/30 bg-[var(--c1)]/10 px-2 py-1 text-[12px] font-semibold text-[var(--c1)]">
                    省 {m.savePercent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 生图模型 */}
      <h2 className="mt-14 text-[20px] font-semibold">生图模型</h2>
      <p className="mt-2 text-[13.5px] text-[var(--dim)]">
        按张计费,生成失败不扣费。1K 与 4K 是两个独立模型名,按下方 id 调用
      </p>
      <p className="mt-3 rounded-lg border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
        <span className="font-semibold text-[var(--fg)]">调用 4K 时请务必传 <code className="font-mono">size=&quot;3840x2160&quot;</code>。</span>
        {' '}计费按模型名结算,不看 size 参数——用 4K 模型却传 1024×1024,仍按 4K 单价扣费。Nano Banana Pro 需传 quality=&quot;4K&quot; 才出高分辨率。
        反之 1K 模型不支持 4K 尺寸,传了会被直接拒绝(不扣费)。
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {imageModels.map((m) => (
          <div key={m.id} className="glass p-5">
            <div className="text-[15.5px] font-semibold">{m.name}</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-[var(--dim)]">
              {m.id}
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
              {m.blurb}
            </p>
            <div className="mt-4 space-y-2.5 border-t border-[var(--border)] pt-4">
              {m.tiers.map((t) => (
                <div key={t.label} className="flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-[13.5px] font-medium">{t.label}</span>
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
          </div>
        ))}
      </div>

      {/* 视频模型 */}
      <h2 className="mt-14 text-[20px] font-semibold">视频模型</h2>
      <p className="mt-2 text-[13.5px] text-[var(--dim)]">
        按秒计费,总价 = 每秒单价 × 生成时长。时长由请求参数 duration 指定
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-[14px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[12.5px] text-[var(--dim)]">
              <th className="py-3 pr-4 font-medium">模型</th>
              <th className="py-3 pr-4 font-medium">分辨率</th>
              <th className="py-3 pr-4 font-medium">可选时长</th>
              <th className="py-3 pr-4 text-right font-medium">单价</th>
              <th className="py-3 text-right font-medium">5 秒约</th>
            </tr>
          </thead>
          <tbody>
            {videoModels.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)]">
                <td className="py-4 pr-4">
                  <div className="font-medium">{m.name}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-[var(--dim)]">
                    {m.id}
                  </div>
                  <div className="mt-1 text-[12.5px] text-[var(--muted)]">{m.blurb}</div>
                  {m.note && (
                    <div className="mt-1.5 inline-block rounded border border-[var(--warn)]/35 bg-[var(--warn)]/8 px-2 py-0.5 text-[11.5px] text-[var(--warn)]">
                      {m.note}
                    </div>
                  )}
                </td>
                <td className="py-4 pr-4 whitespace-nowrap font-mono text-[13px]">
                  {m.resolution}
                </td>
                <td className="py-4 pr-4 whitespace-nowrap font-mono text-[13px] text-[var(--dim)]">
                  {m.minSeconds}–{m.maxSeconds} 秒
                </td>
                <td className="py-4 pr-4 text-right whitespace-nowrap font-mono font-semibold">
                  ¥{m.pricePerSecond}
                  <span className="ml-0.5 text-[11.5px] font-normal text-[var(--dim)]">
                    /秒
                  </span>
                </td>
                <td className="py-4 text-right whitespace-nowrap font-mono text-[13px] text-[var(--dim)]">
                  ¥{(m.pricePerSecond * 5).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
