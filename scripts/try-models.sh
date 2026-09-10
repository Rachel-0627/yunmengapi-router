#!/usr/bin/env bash
# 同一个问题问遍所有文本模型,对比回答质量、速度和花费。
#
#   export YUNMENG_KEY="sk-..."
#   bash scripts/try-models.sh "你的问题"
#   bash scripts/try-models.sh "你的问题" claude-opus-5 gpt-6-astra   # 只测指定的

set -uo pipefail

BASE="${YUNMENG_BASE:-https://api.yunmengapi.com}"
TIMEOUT="${TIMEOUT:-120}"
MAXTOK="${MAXTOK:-400}"

# 模型名 输入价 输出价(¥/1M) —— 与控制台保持一致,改价后记得同步
ALL=(
  "claude-haiku-4-5-20251001 2.20 11.00"
  "claude-sonnet-5           4.40 22.00"
  "claude-opus-5            11.00 55.00"
  "claude-fable-5           41.25 206.25"
  "gpt-5.4-mini              0.70 4.20"
  "gpt-5.4                   2.10 12.60"
  "gpt-5.6-terra             2.50 15.00"
  "gpt-5.6-sol               5.00 30.00"
  "gpt-5.5                   5.00 40.00"
  "gpt-6-astra              10.00 50.00"
)

[ -n "${YUNMENG_KEY:-}" ] || { echo "先设置:export YUNMENG_KEY=\"sk-...\"" >&2; exit 1; }
command -v python3 >/dev/null || { echo "需要 python3" >&2; exit 1; }

PROMPT="${1:-用三句话解释什么是 API 中转站,面向完全不懂技术的人。}"
shift 2>/dev/null || true
PICK=("$@")

want() {   # 没指定就全测;指定了只测匹配的
  [ ${#PICK[@]} -eq 0 ] && return 0
  for p in "${PICK[@]}"; do [ "$p" = "$1" ] && return 0; done
  return 1
}

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
TOTAL=0

echo
echo "问题:$PROMPT"
echo "════════════════════════════════════════════════════════════"

for row in "${ALL[@]}"; do
  read -r M PIN POUT <<<"$row"
  want "$M" || continue

  body=$(python3 -c '
import json,sys
print(json.dumps({"model":sys.argv[1],"max_tokens":int(sys.argv[2]),
 "messages":[{"role":"user","content":sys.argv[3]}]},ensure_ascii=False))' \
    "$M" "$MAXTOK" "$PROMPT")

  t0=$(python3 -c 'import time;print(time.time())')
  http=$(curl -s -o "$TMP/r" -w '%{http_code}' -m "$TIMEOUT" \
    "$BASE/v1/chat/completions" \
    -H "Authorization: Bearer $YUNMENG_KEY" \
    -H "Content-Type: application/json" -d "$body" 2>/dev/null)
  t1=$(python3 -c 'import time;print(time.time())')
  el=$(python3 -c "print(f'{$t1-$t0:.1f}')")

  if [ "$http" != "200" ]; then
    msg=$(python3 -c '
import json,sys
try: print(json.load(open(sys.argv[1]))["error"]["message"][:80])
except Exception: print("(无法解析)")' "$TMP/r")
    printf "\n【%s】 ❌ HTTP %s  %s\n" "$M" "$http" "$msg"
    continue
  fi

  out=$(python3 - "$TMP/r" "$PIN" "$POUT" "$el" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
pin,pout,el=float(sys.argv[2]),float(sys.argv[3]),sys.argv[4]
u=d.get("usage") or {}
i,o=u.get("prompt_tokens",0),u.get("completion_tokens",0)
cost=i*pin/1e6+o*pout/1e6
txt=(d.get("choices") or [{}])[0].get("message",{}).get("content") or ""
speed=f"{o/float(el):.0f}" if float(el)>0 else "-"
print(f"{el}|{i}|{o}|{cost:.5f}|{speed}")
print(txt.strip())
PY
)
  meta=$(printf '%s' "$out" | head -1)
  text=$(printf '%s' "$out" | tail -n +2)
  IFS='|' read -r el i o cost speed <<<"$meta"
  TOTAL=$(python3 -c "print(f'{$TOTAL+$cost:.5f}')")

  printf "\n【%s】\n" "$M"
  printf "  %ss · 输入 %s / 输出 %s tokens · %s tok/s · ¥%s\n\n" \
    "$el" "$i" "$o" "$speed" "$cost"
  printf '%s\n' "$text" | sed 's/^/  /'
  echo "  ────────────────────────────────────────────────────────"
done

echo
printf "本次总花费:¥%s\n\n" "$TOTAL"
