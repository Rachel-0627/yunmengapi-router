import { site } from './site'
import type { Snippet } from '@/components/code-tabs'

const BASE = site.apiBaseUrl

/** 对话补全:首页快速接入 + 文档页共用 */
export const chatSnippets: Snippet[] = [
  {
    label: 'cURL',
    lang: 'bash',
    code: `curl ${BASE}/v1/chat/completions \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-5",
    "messages": [{"role": "user", "content": "你好"}]
  }'`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `from openai import OpenAI

client = OpenAI(
    api_key="你的 API Key",
    base_url="${BASE}/v1",
)

resp = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)`,
  },
  {
    label: 'Node.js',
    lang: 'javascript',
    code: `import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: '${BASE}/v1',
})

const resp = await client.chat.completions.create({
  model: 'claude-sonnet-5',
  messages: [{ role: 'user', content: '你好' }],
})
console.log(resp.choices[0].message.content)`,
  },
  {
    label: 'Go',
    lang: 'go',
    code: `config := openai.DefaultConfig(os.Getenv("API_KEY"))
config.BaseURL = "${BASE}/v1"
client := openai.NewClientWithConfig(config)

resp, err := client.CreateChatCompletion(
    context.Background(),
    openai.ChatCompletionRequest{
        Model: "claude-sonnet-5",
        Messages: []openai.ChatCompletionMessage{
            {Role: "user", Content: "你好"},
        },
    },
)`,
  },
]

/** 三种协议端点:同一个 Key 都能用 */
export const protocolSnippets: Snippet[] = [
  {
    label: 'OpenAI 协议',
    lang: 'bash',
    code: `POST ${BASE}/v1/chat/completions

# 最通用。绝大多数客户端和 SDK 都支持,
# 只需把 base_url 改成上面这个地址。`,
  },
  {
    label: 'Claude 协议',
    lang: 'bash',
    code: `POST ${BASE}/v1/messages

# Anthropic 原生格式。Claude Code、
# anthropic-sdk 走这个端点。
# 请求头用 x-api-key,不是 Authorization。`,
  },
  {
    label: 'Gemini 协议',
    lang: 'bash',
    code: `POST ${BASE}/v1beta/models/{model}:generateContent

# Google 原生格式。已有 Gemini 项目
# 可以零改动切过来。`,
  },
]

/** 生图 */
export const imageSnippets: Snippet[] = [
  {
    label: 'cURL',
    lang: 'bash',
    code: `curl ${BASE}/v1/images/generations \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "一只在雪地里打滚的柴犬,电影感光线",
    "size": "1024x1024",
    "n": 1
  }'`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `from openai import OpenAI

client = OpenAI(
    api_key="你的 API Key",
    base_url="${BASE}/v1",
)

# size 决定计费档位:1024x1024 走 1K 价,更高走 4K 价
resp = client.images.generate(
    model="gpt-image-2",
    prompt="一只在雪地里打滚的柴犬,电影感光线",
    size="1024x1024",
    n=1,
)
print(resp.data[0].url)`,
  },
]
