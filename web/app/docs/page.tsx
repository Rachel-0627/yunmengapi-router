import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { CodeTabs } from '@/components/code-tabs'
import { chatSnippets, protocolSnippets, imageSnippets, videoSnippets } from '@/lib/snippets'
import { clients, vendors, errors } from '@/lib/docs-data'

export const metadata: Metadata = {
  title: '接入文档',
  description: '五分钟接入。对话、生图、视频三类接口说明,完全兼容 OpenAI SDK。',
}

export default function Page() {
  return (
    <main className="relative">
      <div className="grid-bg opacity-40" />
      <div className="relative mx-auto max-w-4xl px-5 py-16 sm:py-20">
        <h1 className="text-[30px] font-bold tracking-tight sm:text-[40px]">
          接入<span className="grad-text">文档</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[var(--muted)]">
          完全兼容 OpenAI SDK。已有项目只需替换 <code className="font-mono text-[var(--c1)]">base_url</code> 和{' '}
          <code className="font-mono text-[var(--c1)]">api_key</code>,其余代码零改动。
        </p>

        <Block n="01" t="拿到 API Key">
          <ol className="space-y-2.5 text-[14.5px] leading-relaxed text-[var(--muted)]">
            <li>1. 用邮箱注册账户,无需信用卡</li>
            <li>2. 在控制台用支付宝或微信充值,实时到账</li>
            <li>3. 进入「令牌」页面创建一个 Key,复制备用</li>
          </ol>
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 text-[13px] text-[var(--dim)]">
            ⚠️ Key 等同于你的钱包。不要写死在前端代码里,不要提交到 Git 仓库。
            建议放环境变量,并在代码里设置调用次数上限——死循环烧额度是最常见的事故。
          </p>
        </Block>

        <Block n="02" t="接口地址">
          <p className="mb-4 text-[14.5px] text-[var(--muted)]">
            把原来的官方地址换成:
          </p>
          <pre className="glass overflow-x-auto p-4 font-mono text-[14px]">
            <code className="text-[var(--c1)]">{site.apiBaseUrl}/v1</code>
          </pre>
          <p className="mt-4 text-[14.5px] text-[var(--muted)]">
            同一个 Key 支持三种协议,按你的客户端选一个:
          </p>
          <div className="mt-4">
            <CodeTabs snippets={protocolSnippets} />
          </div>
        </Block>

        <Block n="03" t="发起对话请求">
          <CodeTabs snippets={chatSnippets} />
        </Block>

        <Block n="04" t="生图请求">
          <p className="mb-4 text-[14.5px] leading-relaxed text-[var(--muted)]">
            按张计费,生成失败不扣费。
            <span className="text-[var(--fg)]">1K 与 4K 是两个独立模型名</span>
            ——计费按模型名结算,<span className="text-[var(--fg)]">不看 size 参数</span>:
            用 4K 模型却传 1024×1024,仍按 4K 单价扣费;1K 模型不支持 4K 尺寸,传了会被直接拒绝(不扣费)。
          </p>
          <CodeTabs snippets={imageSnippets} />
        </Block>

        <Block n="05" t="生成视频">
          <p className="mb-4 text-[14.5px] leading-relaxed text-[var(--muted)]">
            视频是<span className="text-[var(--fg)]">异步</span>的:提交任务拿到{' '}
            <code className="font-mono text-[var(--c1)]">task_id</code>,轮询到{' '}
            <code className="font-mono text-[var(--c1)]">completed</code> 后下载。整段约 1–3 分钟。
            按秒计费,总价 = 每秒单价 × <code className="font-mono text-[var(--c1)]">duration</code>,不填默认 4 秒。
          </p>
          <CodeTabs snippets={videoSnippets} />
          <p className="mt-4 rounded-lg border border-[var(--warn)]/30 bg-[var(--warn)]/5 p-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
            <span className="font-semibold text-[var(--fg)]">视频地址是临时的,请及时下载或转存。</span>
            {' '}生成结果不长期保留,不要把返回的 url 当作长期存储引用。
          </p>
        </Block>

        <Block n="06" t="模型怎么选">
          <div className="space-y-3">
            {vendors.map((v) => (
              <div key={v.n} className="glass p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-[14.5px] font-semibold">{v.n}</div>
                  <div className="font-mono text-[11.5px] text-[var(--dim)]">{v.m}</div>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{v.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--dim)]">
            所有厂商的文本模型都能用同一个 OpenAI 兼容端点调用,换 model 字段即可,其余代码不用改。
            完整价格见 <a href="/pricing" className="text-[var(--c1)] hover:underline">价格页</a>。
          </p>
        </Block>

        <Block n="07" t="常用客户端配置">
          <div className="grid gap-3 sm:grid-cols-2">
            {clients.map((c) => (
              <div key={c.n} className="glass p-4">
                <div className="text-[14px] font-semibold">{c.n}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </Block>

        <Block n="08" t="错误码">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[14px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[12.5px] text-[var(--dim)]">
                  <th className="py-3 pr-4 font-medium">状态码</th>
                  <th className="py-3 pr-4 font-medium">含义</th>
                  <th className="py-3 font-medium">怎么办</th>
                </tr>
              </thead>
              <tbody>
                {errors.map(([code, name, fix]) => (
                  <tr key={code} className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-mono font-semibold text-[var(--c1)]">
                      {code}
                    </td>
                    <td className="py-3 pr-4">{name}</td>
                    <td className="py-3 text-[13.5px] text-[var(--muted)]">{fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <div className="mt-14 rounded-xl border border-[var(--warn)]/25 bg-[var(--warn)]/5 p-5">
          <div className="text-[15px] font-semibold">接入前请务必知道</div>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
            本站是独立第三方网关,与模型厂商无授权关系。经由本站的请求,上游链路可能附加系统级指令,
            会影响模型的措辞风格和自我描述,但不影响函数调用的正确性。
          </p>
        </div>
      </div>
    </main>
  )
}

function Block({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-[19px] font-semibold">
        <span className="mr-2.5 font-mono text-[var(--c1)]">{n}</span>
        {t}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}
