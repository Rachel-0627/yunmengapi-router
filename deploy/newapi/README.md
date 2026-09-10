# 云梦定制版 new-api

本目录**不存 new-api 源码**,只存一个补丁。构建在 GitHub Actions 上完成。

```
base-commit     上游锁定的 commit,构建时按它 checkout
yunmeng.patch   我们的全部改动(7 个文件,21 行)
```

## 为什么是补丁不是 fork

fork 有 24MB,而我们只改了 21 行。存补丁的好处:

- 仓库小,`git diff` 一眼看清改了什么
- 上游升级时,补丁打不上会立刻报错,而不是悄悄丢改动
- 满足 AGPL 第 13 条对"提供修改后源码"的要求 —— 补丁 + 锚点即可复现

## 当前改了什么

| 文件 | 改动 |
|---|---|
| `VERSION` | 标记为 `v1.0.0-rc.25-persecond` |
| `Dockerfile` | 两个 builder 阶段加 `--platform=$BUILDPLATFORM`(跨架构构建不崩) |
| `model-billing-mode-badge.tsx` | 视频模型显示「按秒计费」而非「按次计费」 |
| `recharge-form-card.tsx` | 兑换码购买链接加大加粗、用主题色 |
| `i18n` zh / zh-TW / en | 上面两处的文案 |

## 怎么触发构建

改完补丁 `git push`,Actions 自动跑。也可以在仓库 Actions 页手动点 `build-newapi`。

产物:`ghcr.io/<用户名>/yunmengapi-newapi:latest` 和 `:<commit sha>`。

## 怎么重新生成补丁

本地在 `vendor/new-api`(gitignore,不入库)里改完之后:

```bash
cd vendor/new-api
git diff > ../../deploy/newapi/yunmeng.patch
git rev-parse HEAD > ../../deploy/newapi/base-commit
```

⚠️ `git diff` 只含**已跟踪文件的修改**。若新增了文件,要先 `git add` 再用 `git diff --cached`。

## 上游升级怎么做

```bash
cd vendor/new-api
git fetch origin && git checkout <新的 commit>
git apply ../../deploy/newapi/yunmeng.patch    # 有冲突就手工改
git rev-parse HEAD > ../../deploy/newapi/base-commit
```

打不上说明上游动了同一块代码,需要人工合并后重新生成补丁。

## 服务器怎么用

`deploy/docker-compose.yml` 里 new-api 的 image 改成 GHCR 地址,然后:

```bash
docker compose pull new-api && docker compose up -d new-api
```

镜像若设为私有,服务器需要先 `docker login ghcr.io`(用一个只读 PAT)。
设为公开则无需登录 —— 镜像里没有任何密钥,配置全在服务器的环境变量里。
