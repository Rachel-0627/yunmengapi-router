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

/** 生图:1K 与 4K 是两个独立模型名,计费按模型名结算,不看 size */
export const imageSnippets: Snippet[] = [
  {
    label: 'cURL',
    lang: 'bash',
    code: `curl ${BASE}/v1/images/generations \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image2-1k",
    "prompt": "一只在雪地里打滚的柴犬,电影感光线",
    "size": "1024x1024",
    "n": 1
  }'

# 4K 换成 "model": "gpt-image2-4k" 并传 "size": "3840x2160"`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `from openai import OpenAI

client = OpenAI(api_key="你的 API Key", base_url="${BASE}/v1")

resp = client.images.generate(
    model="gpt-image2-1k",     # 4K 用 gpt-image2-4k
    prompt="一只在雪地里打滚的柴犬,电影感光线",
    size="1024x1024",          # 4K 用 3840x2160
    n=1,
)
print(resp.data[0].url)`,
  },
]

/** 视频:异步三步 —— 提交、轮询、下载 */
export const videoSnippets: Snippet[] = [
  {
    label: 'cURL',
    lang: 'bash',
    code: `# ① 提交任务
curl ${BASE}/v1/videos \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "seedance-2.0-720p",
    "prompt": "一只橘猫在草地上慢慢走过,阳光,电影感",
    "duration": 5,
    "aspect_ratio": "16:9"
  }'
# → {"task_id": "task_xxx", "status": "queued", "seconds": "5"}

# ② 轮询,直到 status 变成 completed
curl ${BASE}/v1/videos/task_xxx \\
  -H "Authorization: Bearer $API_KEY"
# → {"status": "completed", "progress": 100, "url": "https://..."}

# ③ 下载上一步返回的 url(无需鉴权)`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `import time, requests

BASE, KEY = "${BASE}", "你的 API Key"
H = {"Authorization": f"Bearer {KEY}"}

# ① 提交
task = requests.post(f"{BASE}/v1/videos", headers=H, json={
    "model": "seedance-2.0-720p",
    "prompt": "一只橘猫在草地上慢慢走过,阳光,电影感",
    "duration": 5,            # 4-15 秒;seedance2.5 支持到 30 秒
    "aspect_ratio": "16:9",
}).json()

# ② 轮询(整段约 1-3 分钟)
while True:
    r = requests.get(f"{BASE}/v1/videos/{task['task_id']}", headers=H).json()
    if r["status"] in ("completed", "failed"):
        break
    time.sleep(5)

# ③ 下载
if r["status"] == "completed":
    open("out.mp4", "wb").write(requests.get(r["url"]).content)`,
  },
]
