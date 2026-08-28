#!/usr/bin/env bash
# 在【开发机】上构建营销站,生成 web/.deploy-bundle 成品包。
# 服务器内存太小,不能在上面编译,所以构建这一步放在本地。
set -euo pipefail
cd "$(dirname "$0")/../web"
echo "▶ 构建中…"
npm run build
echo "▶ 组装成品包…"
rm -rf .deploy-bundle && mkdir -p .deploy-bundle/.next
cp -R .next/standalone/. .deploy-bundle/
cp -R .next/static .deploy-bundle/.next/static
[ -d public ] && cp -R public .deploy-bundle/public || true
echo "✅ 完成:web/.deploy-bundle ($(du -sh .deploy-bundle | cut -f1))"
