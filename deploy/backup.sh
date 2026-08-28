#!/usr/bin/env bash
#
# 每日备份。打成单个归档,包含:
#   db.sql            PostgreSQL 全量导出(用户/余额/渠道/令牌/日志/配置)
#   env               .env —— 含 CRYPTO_SECRET,没有它数据库里的敏感字段解不开
#   docker-compose.yml / Caddyfile   部署配置,便于整机重建
#
# ⚠️ 备份存在本机。这只能防「误删/数据损坏」,防不了「服务器整台没了」。
#    重要数据请定期用 rsync 拉一份到本地,见文件末尾说明。
#
# 挂 crontab:  0 4 * * * /opt/yunmeng/deploy/backup.sh >> /var/log/yunmeng-backup.log 2>&1

set -euo pipefail
# cron 的 PATH 很窄,显式补全
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
cd "$(dirname "$0")"
. ./.env

DEST=./backups
KEEP_DAYS=14
mkdir -p "$DEST"; chmod 700 "$DEST"

STAMP=$(date +%Y%m%d-%H%M%S)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# 1. 数据库
docker compose exec -T postgres pg_dump -U "$PG_USER" -d "$PG_DB" > "$TMP/db.sql"

# 2. 配置(含密钥)
cp .env "$TMP/env"
cp docker-compose.yml Caddyfile "$TMP/" 2>/dev/null || true

# 3. new-api 数据目录(当前为空;将来若改用 SQLite 或存文件会用到)
if [ -d data ] && [ -n "$(ls -A data 2>/dev/null || true)" ]; then
  cp -R data "$TMP/data" 2>/dev/null || sudo cp -R data "$TMP/data"
fi

tar czf "$DEST/yunmeng-$STAMP.tar.gz" -C "$TMP" .
chmod 600 "$DEST/yunmeng-$STAMP.tar.gz"

# 清理:旧归档 + 上一版脚本留下的碎片
find "$DEST" -name 'yunmeng-*.tar.gz' -mtime +$KEEP_DAYS -delete
find "$DEST" \( -name 'db-*.sql.gz' -o -name 'data-*.tar.gz' \) -delete 2>/dev/null || true

SIZE=$(du -h "$DEST/yunmeng-$STAMP.tar.gz" | cut -f1)
echo "[$(date '+%F %T')] ✅ 备份完成 yunmeng-$STAMP.tar.gz ($SIZE),保留 ${KEEP_DAYS} 天"

# ── 拉回本地的命令(在你的 Mac 上执行)──
#   rsync -avz -e "ssh -i ~/.ssh/yunmeng_deploy" \
#     admin@47.76.40.132:/opt/yunmeng/deploy/backups/ ~/yunmeng-backups/
