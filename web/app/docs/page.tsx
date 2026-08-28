import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { CodeTabs } from '@/components/code-tabs'
import { chatSnippets, protocolSnippets, imageSnippets } from '@/lib/snippets'

export const metadata: Metadata = {
  title: '接入文档',
  description: '五分钟接入。完全兼容 OpenAI SDK,已有项目只需替换 base_url。',
}

const clients = [
  { n: 'Claude Code', d: '设置环境变量 ANTHROPIC_BASE_URL 指向本站,ANTHROPIC_AUTH_TOKEN 填你的 Key。' },
  { n: 'Cherry Studio', d: '设置 → 模型服务 → 添加提供商 → 选 OpenAI 兼容 → 填入 API 地址和 Key。' },
  { n: 'Cline / Roo Code', d: 'API Provider 选 OpenAI Compatible,Base URL 和 API Key 按下方填。' },
  { n: 'LobeChat / NextChat', d: '在设置里把 OpenAI 接口地址改成本站地址即可。' },
]

const errors = [
  ['401', '认证失败', 'Key 错误、已吊销,或请求头格式不对'],
  ['402', '额度不足', '账户余额用完了,去控制台充值'],
  ['404', '模型不存在', '模型名拼写错误,或该模型未在你的分组开放'],
  ['429', '请求过快', '触发限流,降低并发或稍后重试'],
  ['500', '上游异常', '上游波动,通常会自动切换渠道,建议重试'],
  ['503', '暂时不可用', '所有渠道都不可用,请稍后再试'],
]

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
            生图按张计费,不按 token。<code className="font-mono text-[var(--c1)]">size</code>{' '}
            决定计费档位:1024×1024 走 1K 价(¥0.05/张),更高分辨率走 4K 价(¥0.145/张)。
            <span className="text-[var(--fg)]">生成失败不扣费。</span>
          </p>
          <CodeTabs snippets={imageSnippets} />
        </Block>

        <Block n="05" t="常用客户端配置">
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

        <Block n="06" t="错误码">
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
