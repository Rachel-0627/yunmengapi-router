#!/usr/bin/env bash
# 生成随机强密码并写入 .env。已有值不会被覆盖。
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || cp .env.example .env

rand() { openssl rand -base64 33 | tr -d '/+=\n' | cut -c1-32; }

for key in PG_PASSWORD REDIS_PASSWORD SESSION_SECRET CRYPTO_SECRET; do
  cur=$(grep -E "^${key}=" .env | cut -d= -f2-)
  if [ -z "$cur" ]; then
    val=$(rand)
    # BSD 与 GNU sed 参数不同,用临时文件规避
    awk -v k="$key" -v v="$val" 'BEGIN{FS=OFS="="} $1==k{print k"="v; next} {print}' .env > .env.tmp
    mv .env.tmp .env
    echo "  ✅ 已生成 $key"
  else
    echo "  ⏭  $key 已存在,跳过"
  fi
done
chmod 600 .env
echo
echo "  .env 权限已设为 600(仅当前用户可读)"
