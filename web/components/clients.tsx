import { Section } from './section'

const clients = [
  { name: 'Claude Code', d: '官方命令行编码助手' },
  { name: 'Cherry Studio', d: '国内常用桌面客户端' },
  { name: 'Cline / Roo Code', d: 'VS Code 编码插件' },
  { name: 'LobeChat', d: '自部署对话前端' },
  { name: 'ChatBox', d: '跨平台桌面客户端' },
  { name: 'NextChat', d: '轻量网页对话端' },
  { name: 'OpenCat', d: 'iOS / macOS 客户端' },
  { name: 'Dify / n8n', d: '工作流与智能体编排' },
]

export function Clients() {
  return (
    <Section
      eyebrow="Compatible"
      title={<>你在用的工具,<span className="grad-text">基本都能接</span></>}
      desc="凡是支持自定义 OpenAI 接口地址的客户端,填入我们的地址和 Key 即可使用。"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {clients.map((c) => (
          <div key={c.name} className="glass glass-hover px-4 py-3.5">
            <div className="text-[14px] font-medium">{c.name}</div>
            <div className="mt-0.5 text-[12.5px] text-[var(--dim)]">{c.d}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
