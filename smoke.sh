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
check "every post page renders (canonical → eschmechel.dev)" bash -c '
  for slug in $(ls dist/blog | grep -v index.html); do
    curl -fsL "http://127.0.0.1:'"$PORT"'/blog/$slug" | grep -q "<link rel=\"canonical\" href=\"https://eschmechel.dev/blog/$slug\"" || exit 1
  done'
check "rss.xml lists every post" bash -c "[ \$(curl -fs http://127.0.0.1:$PORT/rss.xml | grep -o '<item>' | wc -l) -eq \$(ls dist/blog | grep -vc index.html) ]"
check "sitemap includes posts" bash -c "grep -q '/blog/your-ai-slop-bores-me/' dist/sitemap-0.xml"
check "agent API logic (mock AI + KV)" node tests/api.check.mjs
check "Pages Functions bundle" bash -c "npx wrangler pages functions build --outdir \"\${TMPDIR:-/tmp}/eschmechel-fn\" >/dev/null 2>&1"
check "favicon served" curl -fs "http://127.0.0.1:$PORT/favicon.svg"
check "resume PDF served" bash -c "curl -fsI http://127.0.0.1:$PORT/Elliott-Schmechel-Resume.pdf | grep -qi 'application/pdf'"
check "project thumbnails optimised" bash -c "ls dist/_astro/*.webp >/dev/null"
check "banner matches figlet byte-for-byte" node tests/banner.check.mjs
check "14 KB first-flight budget (gzip, CSS inlined)" node tests/budget.check.mjs
check "no skill-rating markup on column pages (D12)" bash -c "! grep -Eiq '(★|☆|[0-9]+ ?/ ?(5|10)\\b|progress|level)' dist/index.html dist/*/index.html"

echo "smoke: $pass/$total"
[ "$pass" -eq "$total" ]
