#!/usr/bin/env bash
# Standing gate: build + typecheck, then serve dist and check every route renders its column.
# Usage: ./smoke.sh            Prints "smoke: N/N" and exits non-zero on any failure.
set -uo pipefail
cd "$(dirname "$0")"

PORT="${SMOKE_PORT:-4391}"
pass=0
total=0
check() { # name, command...
  local name="$1"; shift
  total=$((total + 1))
  if "$@" >/dev/null 2>&1; then pass=$((pass + 1)); echo "  ok   $name"; else echo "  FAIL $name"; fi
}

echo "smoke: build"
check "astro check + build" npm run build --silent

./node_modules/.bin/astro preview --ignore-lock --port "$PORT" --host 127.0.0.1 >/dev/null 2>&1 &
server=$!
trap 'kill $server 2>/dev/null' EXIT
for _ in $(seq 1 50); do curl -fs "http://127.0.0.1:$PORT/" >/dev/null && break; sleep 0.2; done

route() { # path, column-id
  local html
  html="$(curl -fsL "http://127.0.0.1:$PORT$1")" || return 1
  grep -q "id=\"col-$2\"[^>]*data-active=\"true\"" <<<"$html" || return 1
  [ "$(grep -o 'class="column"' <<<"$html" | wc -l)" -eq 5 ]
}

echo "smoke: routes"
check "/ → whoami" route / whoami
check "/projects → projects" route /projects projects
check "/resume → resume" route /resume resume
check "/blog → blog" route /blog blog
check "/~ → home" route /~ home
check "favicon served" curl -fs "http://127.0.0.1:$PORT/favicon.svg"
check "no skill-rating markup (D12)" bash -c "! grep -rEiq '(★|☆|[0-9]+ ?/ ?(5|10)\\b|progress|level)' dist --include=*.html"

echo "smoke: $pass/$total"
[ "$pass" -eq "$total" ]
