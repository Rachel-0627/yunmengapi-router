# PROJECT_MAP · 中文站(云梦API)

> 每次新增或改动文件,必须同步更新本文件。

## 一句话定位

面向中国开发者的 AI 模型 API 中转站。**后端直接用开源项目 new-api,前端自己写。**

## 架构

**按子域名切分**,不按路径 —— 因为 new-api 自身占用了 `/`、`/pricing`、`/models`、
`/register` 等路径,与营销站直接冲突。

```
                Caddy(80/443,自动 HTTPS)
                          │
  yunmengapi.com     console.yunmengapi.com    api.yunmengapi.com
        ↓                    ↓                        ↓
   web:3001            new-api:3000            new-api:3000
   (本仓库营销站)      (注册/登录/控制台/后台)   (/v1/* API 端点)
                             ↓
              postgres + redis(internal 网络,不对外开放端口)
```

**关键约束:new-api 的源码一行都不改。** 它是 AGPL-3.0 协议,改了就必须开源你的修改。
所有定制只做在本仓库的前端里。`vendor/new-api` 仅供本地查阅,已 gitignore。

## 文件地图

### 配置
| 文件 | 职责 |
|---|---|
| `.gitignore` | 排除 node_modules / .next / .env / vendor / CLAUDE.md |
| `web/package.json` | 依赖极简:只有 next + react。**无数据库、无 ORM**(计费由 new-api 负责) |
| `web/next.config.ts` | 关闭 poweredByHeader,开启严格模式 |
| `web/tsconfig.json` | 路径别名 `@/*` |
| `web/eslint.config.mjs` | 继承 next 官方规则 |

### 核心数据(改这两个文件就能改全站)
| 文件 | 行数 | 职责 |
|---|---|---|
| `web/lib/site.ts` | 55 | **品牌单一来源**:站名、域名、控制台路径、客服邮箱、合规披露文案。另定义文本加价系数 `MARKUP`(未被组件引用,不进前端包) |
| `web/lib/catalog.ts` | 118 | **全量模型目录**:72 个付费模型,元组格式压缩存储。售价 = 进货价 × 2.5。**已剔除全部免费模型** |
| `web/lib/snippets.ts` | 133 | **共享代码示例**:对话 / 三协议 / 生图。首页和文档页共用,不重复写 |
| `web/lib/models.ts` | 131 | 文本模型 + 生图模型清单(生图为 `gpt-image2-1k`/`-4k` 两个独立模型名)。**只放最终售价和官方公开价,绝不放进货成本**(会被打包进浏览器) |
| `web/lib/docs-data.ts` | 45 | 接入文档页的静态数据:客户端配置、厂商差异、错误码。与页面结构分开 |
| `web/lib/video.ts` | 111 | **视频模型清单与售价**。按【秒】计费,总价 = 每秒单价 × 时长。与 models.ts 拆开是因为计费维度不同 |

### 样式
| 文件 | 行数 | 职责 |
|---|---|---|
| `web/app/globals.css` | 96 | **设计令牌层**:纸墨风配色(对齐 apimart)、字体栈、body 基础样式、焦点框。**改配色只改这里的 `:root`** |
| `web/app/ui.css` | 114 | **工具类层**:卡片 `.glass`、网格背景、按钮、徽章、渐显动画。由 globals.css 导入 |

### 页面
| 文件 | 行数 | 职责 |
|---|---|---|
| `web/app/layout.tsx` | 40 | 根布局 + SEO 元数据(zh-CN)。**Nav / Footer 在这里统一挂载**,各页面不必重复 |
| `web/app/page.tsx` | 55 | 首页:组装七个区块 + 底部 CTA |
| `web/app/pricing/page.tsx` | 158 | 价格页:主力模型表格 + 生图卡片 + **全量模型筛选目录** + 六条计费说明 |
| `web/app/docs/page.tsx` | 144 | 接入文档:取 Key、三种协议、对话与生图示例、客户端配置、错误码 |
| `web/app/legal/terms/page.tsx` | 79 | 服务条款 |
| `web/app/legal/privacy/page.tsx` | 60 | 隐私政策 |
| `web/app/legal/refund/page.tsx` | 54 | 退款政策 |
| `web/app/legal/aup/page.tsx` | 62 | 使用规范 |

### 组件(全部在 `web/components/`)
| 文件 | 行数 | 职责 |
|---|---|---|
| `nav.tsx` | 127 | 顶栏(客户端)。毛玻璃吸顶 + **当前页高亮**:真实路由靠 `usePathname`,首页锚点靠 `IntersectionObserver` 滚动监听 |
| `hero.tsx` | 66 | 首屏:大标题、双 CTA、网格光晕背景 |
| `console-preview.tsx` | 145 | **控制台界面预览**。纯 SVG 手画折线图,零图表库。⚠️ 数字全是示意值,右上角"界面预览"标注**不得移除** |
| `section.tsx` | 37 | 通用区块外壳,统一各段标题排版 |
| `model-cards.tsx` | 19 | 模型区外壳(服务端) |
| `model-catalog.tsx` | 155 | **模型筛选器**(客户端):按类型 / 供应商过滤,药丸标签带实时数量,表格展示全部 72 个模型 |
| `model-tabs.tsx` | 171 | **文本/生图 Tab 切换**(客户端)。文本卡片带官方价划线对比,生图卡片按分辨率档位报价 |
| `code-tabs.tsx` | 55 | 多语言代码切换 + 复制按钮(唯一的客户端组件) |
| `quickstart.tsx` | 40 | 三步接入(示例已抽到 `lib/snippets.ts` 复用) |
| `clients.tsx` | 31 | 兼容客户端列表(Claude Code、Cherry Studio 等) |
| `disclosure.tsx` | 52 | **与官方接口的差异**(⚠️ 已从首页下架,组件保留未删,`page.tsx` 不再引用) |
| `faq.tsx` | 61 | 常见问题,原生 `<details>` 折叠,零 JS |
| `footer.tsx` | 82 | 多列页脚 + 免责声明 |
| `legal-page.tsx` | 72 | 四个法务页共用的排版外壳(标题 / 更新日期 / 编号条款) |

### 参考(不入库)
| 路径 | 说明 |
|---|---|
| `vendor/new-api/` | QuantumNous/new-api 浅克隆,版本 2026-08-21。**只读参考,禁止修改** |

## 已定的事

- **文本定价**:售价 = 进货价 × 2.5,毛利率恒定 60%。**不用"官方价打几折"** —— 中转站成本结构和官方定价结构不同,统一折扣会让 Opus 定得离谱高
- **生图定价**:逐档写死(1K ¥0.05 / 4K ¥0.145)。上游 4K 是 1K 的 5.17 倍,竞品只有 2.47 倍,不能统一折扣
- **成本不进前端**:`models.ts` 只存售价;成本在 `docs/定价成本.md`,已 gitignore
- **不做任何赠送**:充多少用多少。理由是赠送额度会开退费漏洞(充200送20,用完200再退款)
- **不上架任何免费模型**:上游有 9 个免费模型,全部剔除。**站上不放任何可被薅羊毛的产品或功能**
- **分组是渠道差异,不是会员等级**:进货按默认分组;Fable 5 与无日期后缀的 Haiku 只在更贵的 Claude 专属分组
- **不放厂商 logo**:不使用 Anthropic/OpenAI/Google 的商标图片,避免暗示授权关系。全站零 `<img>` 标签
- **不装假数据**:控制台预览明确标注"界面预览"
- **视觉风格**:纸墨风,参照 apimart 的真实色板扒取
  - 浅色:纸底 `#f7f5f4` / 卡片 `#fafafa` / 墨字 `#020202` / 描边 `#e2dedb`
  - 深色:碳底 `#080808` / 卡片 `#141312` / 描边 `#2b2927`
  - 强调:烧橙 `#d9551a`(深色模式 `#ef6d33`),**全站只此一个强调色**
  - 原则:不用霓虹渐变、不用发光、不用玻璃拟态。卡片是实底 + 细描边 + 轻阴影
  - 焦点框统一用品牌橙,覆盖浏览器默认的蓝色;鼠标点击不显示,仅键盘 Tab 显示
  - 所有文字色对比度经 WCAG 校验,最低 3.11:1(弱文字),正文 19:1

## 部署

配置文件全在 `deploy/`,操作步骤见 `docs/部署指南.md`。

| 文件 | 职责 |
|---|---|
| `deploy/docker-compose.yml` | 六个容器:caddy / web / new-api / image-shim / postgres / redis。**已加固** |
| `deploy/image-shim/server.js` | **生图翻译层**(165 行,零依赖 Node)。上游生图仅有异步接口、new-api 仅支持同步,本服务对 new-api 装成同步接口,内部跑「提交 → 轮询 → 拿图」。**不改 new-api 源码** |
| `deploy/image-shim/Dockerfile` | 翻译层镜像,`node:22-alpine`,非 root 运行 |
| `deploy/Caddyfile` | 三个子域名的反向代理 + 自动 HTTPS + 安全响应头 |
| `deploy/Dockerfile.web` | 营销站镜像,多阶段构建,非 root 运行 |
| `deploy/.env.example` | 环境变量模板(真实 `.env` 已 gitignore) |
| `deploy/gen-secrets.sh` | 生成随机强密码,并把 `.env` 权限设为 600 |
| `deploy/backup.sh` | 每日备份数据库与数据目录,保留 14 天 |
| `deploy/build-web.sh` | **在开发机上**构建营销站,产出 `web/.deploy-bundle` 成品包 |

### 线上现状(2026-08-27 已上线)

```
服务器   阿里云国际站 香港 2C2G  47.76.40.132  $8.80/月含税
域名     yunmengapi.com(Porkbun,$11.08/年)
容器     caddy · web · new-api · postgres · redis
```

**两个上游渠道,按模型自动路由 —— 这是保住毛利的关键:**

| 渠道 | 上游分组 | 承载模型 | 进货价 |
|---|---|---|---|
| #1 泽西同学-默认分组 | 默认分组(1x) | opus-5 / sonnet-5 / haiku-4-5-20251001 | 便宜 |
| #2 泽西同学-Claude专属 | Claude 专属(2x) | **仅** fable-5 | 贵一倍 |

⚠️ **一个上游 Key 只绑一个分组。** 若把两个渠道合成一个、统一用 Claude 专属 Key,
Opus/Sonnet 的毛利会从 60% 跌到 20%,且 Haiku 会直接不可用(它不在该分组)。

**实测扣费与定价表逐条吻合,四个模型毛利统一 60%,缓存折扣为用户省 15-20%。**

`claude-fable-5` 特性:上游对它注入约 1800 token 的系统提示词,
单次短问答约 ¥0.032(是 Opus 的 9 倍)。毛利不受影响(上游同样按此收我们),
但**它只适合长文场景**,短问答该用 Sonnet/Haiku。

### ⚠️ 部署铁律:绝不在服务器上构建

目标机 2 核 1.6G,实测**跑不动任何 Docker 构建** —— 编译 new-api 和构建 Next.js
都会把机器压到 SSH 失联,各强制重启过一次。改为「本地构建 + 只传成品」后,
镜像构建从二十多分钟卡死变成 **5.4 秒**。

- `new-api`:官方签名镜像,digest 锁定,不编译
- `web`:开发机跑 `deploy/build-web.sh`,只上传 `.next/standalone` 成品

**核心加固决定:new-api 使用官方镜像并按 sha256 摘要锁定。**

最初的方案是自行编译源码,实测行不通 —— 2 核 1.6G 的机器编译 12 万行 Go
会把机器压死(SSH 失联 25 分钟仍未完成)。

改用官方镜像是**更好**而非妥协的选择:该镜像由 GitHub Actions 在打 tag 时
从公开源码自动构建,带 **cosign keyless 签名**(Sigstore)、**SLSA provenance**
和 **SBOM**。签名可密码学验证构建来源,这比"自己编译"提供的保证更强 ——
自编只能证明"我用这份源码编的",签名能证明"官方 CI 用该 tag 的源码编的"。
配合 `@sha256` 摘要锁定,内容被替换会直接拉取失败。

数据层设为 `internal` 网络,postgres 与 redis 不映射任何主机端口。

已核查:new-api **无任何遥测、心跳、许可证校验或激活码**,启动不联外网;
`analytics` 相关代码需你自行设置环境变量才会注入。AGPL-3.0 意味着
手上这份版本永远免费可商用,即使作者未来改协议也追溯不到。

## 还没做

- [x] ~~域名未购买~~ 已购 **yunmengapi.com**(Porkbun,$11.08/年,2026-08-26)· 站名定为 **云梦API**

- [x] ~~服务器未采购~~ 阿里云国际站香港 2C2G,`47.76.40.132`,$8.80/月含税
- [x] ~~部署~~ 已上线,五个容器运行中,HTTPS 证书自动签发
- [x] ~~管理员账号~~ 已建(`yunmeng`),安装入口已关闭
- [x] ~~渠道与模型倍率~~ 已配并实测验证
- [x] ~~货币与充值换算~~ Price / USDExchangeRate / 充值倍率 全部为 1
- [x] ~~会话安全~~ `SESSION_COOKIE_SECURE` + `TRUSTED_URL` + `TRUSTED_PROXIES` 已配
- [x] ~~自动备份~~ 每日 04:00,保留 14 天,已实跑验证
- [ ] **走通一笔真实充值** —— 生成卡密 → 兑换 → 余额到账 → 消费。**这是唯一还没端到端验证的链路**
- [ ] **在线支付** —— 需易支付商户号;在那之前只能发卡密

### ⚠️ 发卡平台 catfk.com 对境外 IP 重置连接

源站在中国大陆,挂「爱云防护」CDN。**你人在境外打不开自己的店铺后台**,
但**中国大陆客户访问正常,不影响销售**。

管店需借香港服务器做 SOCKS5 跳板,命令见 `docs/部署指南.md` 附录。
若将来目标客户包含境外华人开发者,这个平台会挡住他们,届时需换平台。
- [x] ~~邮件转发~~ 已配通,`support@yunmengapi.com` 转发至 Gmail(实收验证)
- [ ] 定期把备份拉到本地(`rsync` 命令见 `deploy/backup.sh` 末尾注释)
- [x] ~~定价按真实进货成本复核~~ 已完成,见 `docs/定价成本.md`
- [ ] Sonnet/Haiku/Fable 进货价是推算值,需登录上游核对(仅 Opus 实测)
- [ ] 上线后监控生图 4K 失败率(实际毛利仅 20%,失败率超 15% 就亏)
