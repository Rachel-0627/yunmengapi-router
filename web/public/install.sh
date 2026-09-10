#!/usr/bin/env bash
# 云梦 API · Claude Code 一键接入
#   curl -fsSL https://api.yunmengapi.com/install.sh | bash
#
# 做三件事:收 Key → 实测连通 → 写入 shell 配置。
# Key 只发往本站校验,不上传别处,不写日志。

set -uo pipefail

BASE="https://api.yunmengapi.com"
TEST_MODEL="claude-haiku-4-5-20251001"   # 用最便宜的模型验证,单次成本不到一分钱

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  R=$'\e[31m'; G=$'\e[32m'; Y=$'\e[33m'; C=$'\e[36m'; B=$'\e[1m'; N=$'\e[0m'
else
  R=; G=; Y=; C=; B=; N=
fi

info() { printf '%s\n' "$*"; }
ok()   { printf '%s✓%s %s\n' "$G" "$N" "$*"; }
warn() { printf '%s!%s %s\n' "$Y" "$N" "$*"; }
die()  { printf '%s✗ %s%s\n' "$R" "$*" "$N" >&2; exit 1; }

printf '\n%s云梦 API · Claude Code 接入%s\n' "$B" "$N"
printf '%s\n\n' "─────────────────────────────"

# ── 1. 依赖检查 ──────────────────────────────────────
command -v curl >/dev/null 2>&1 || die "需要 curl,请先安装。"

# ── 2. 拿 Key ────────────────────────────────────────
KEY="${YUNMENG_API_KEY:-}"
if [ -z "$KEY" ]; then
  [ -t 0 ] || die "非交互环境请先设置 YUNMENG_API_KEY 环境变量再运行。"
  printf '在 %s/console 新建一个令牌,粘贴到这里\n' "$BASE"
  printf 'API Key (sk-...): '
  read -r KEY
fi

KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
[ -n "$KEY" ] || die "没有输入 Key。"
case "$KEY" in sk-*) ;; *) die "Key 格式不对,应该以 sk- 开头。" ;; esac

# ── 3. 实测连通 ──────────────────────────────────────
info "正在验证 Key…"
BODY=$(printf '{"model":"%s","max_tokens":16,"messages":[{"role":"user","content":"say hi"}]}' "$TEST_MODEL")
RESP=$(curl -sS -m 40 -w $'\n%{http_code}' -X POST "$BASE/v1/messages" \
  -H "Authorization: Bearer $KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d "$BODY" 2>&1) || die "连不上 $BASE,检查网络或代理设置。"

CODE="${RESP##*$'\n'}"
JSON="${RESP%$'\n'*}"

case "$CODE" in
  200) ok "Key 有效,模型已连通" ;;
  401) die "Key 无效或已吊销,请到控制台确认后重试。" ;;
  402) die "账户余额不足,请先充值。" ;;
  404) die "该 Key 的分组里没有 $TEST_MODEL,请到控制台确认令牌的可用模型。" ;;
  429) die "触发限流,稍等一会儿再运行。" ;;
  *)   printf '%s\n' "$JSON" | head -c 300; echo
       die "验证失败(HTTP $CODE),把上面这段发给客服。" ;;
esac

# ── 4. 选 shell 配置文件 ─────────────────────────────
case "${SHELL##*/}" in
  zsh)  RC="$HOME/.zshrc" ;;
  bash) [ "$(uname -s)" = "Darwin" ] && RC="$HOME/.bash_profile" || RC="$HOME/.bashrc" ;;
  fish) RC="" ;;
  *)    RC="$HOME/.profile" ;;
esac

if [ -z "$RC" ]; then
  warn "检测到 fish,请手动把下面两行加进 ~/.config/fish/config.fish:"
  printf '\n  set -gx ANTHROPIC_BASE_URL %s\n  set -gx ANTHROPIC_AUTH_TOKEN %s\n\n' "$BASE" "$KEY"
  exit 0
fi

MARK="# >>> 云梦 API >>>"
END="# <<< 云梦 API <<<"

touch "$RC"
if grep -qF "$MARK" "$RC" 2>/dev/null; then
  BAK="$RC.yunmeng-$(date +%Y%m%d%H%M%S).bak"
  cp "$RC" "$BAK"
  # 删掉旧的整段,再重新写入,避免重复叠加
  awk -v s="$MARK" -v e="$END" '
    $0==s {skip=1} !skip {print} $0==e {skip=0}
  ' "$BAK" > "$RC"
  warn "已覆盖旧配置,原文件备份在 $BAK"
fi

{
  printf '\n%s\n' "$MARK"
  printf 'export ANTHROPIC_BASE_URL="%s"\n' "$BASE"
  printf 'export ANTHROPIC_AUTH_TOKEN="%s"\n' "$KEY"
  printf 'unset ANTHROPIC_API_KEY\n'
  printf '%s\n' "$END"
} >> "$RC"

ok "已写入 $RC"

# ── 5. 收尾提示 ──────────────────────────────────────
printf '\n%s完成。%s\n\n' "$B$G" "$N"
if command -v claude >/dev/null 2>&1; then
  printf '重开一个终端窗口,然后直接运行:\n\n  %sclaude%s\n\n' "$C" "$N"
else
  printf '还没装 Claude Code,先装它:\n\n  %snpm install -g @anthropic-ai/claude-code%s\n\n' "$C" "$N"
  printf '装完重开终端窗口,运行 %sclaude%s 即可。\n\n' "$C" "$N"
fi
printf '用量与余额:%s/console\n\n' "$BASE"
