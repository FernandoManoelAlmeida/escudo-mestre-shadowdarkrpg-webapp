#!/usr/bin/env bash
# Replica o build GitHub Pages (ubuntu-latest, Node 20) antes do push.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export GITHUB_PAGES=1
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/escudo-mestre-shadowdarkrpg-webapp}"
export GITHUB_ACTIONS=true
export CI=true

BP_SEG="${NEXT_PUBLIC_BASE_PATH#/}"

echo "== simulate-github-pages-ci =="
echo "ROOT=$ROOT"
echo "NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH"

rm -rf .next
node scripts/clean-pwa-export-artifacts.js

yarn install --frozen-lockfile
rm -rf .next
rm -f .next/lock 2>/dev/null || true
export NODE_ENV=production
yarn build
yarn verify:pwa-github-pages

echo "== sw.js localizado =="
find public out -name 'sw.js' 2>/dev/null || true
echo "== amostra precache (data) =="
grep -o 'url:"[^"]*data[^"]*"' out/sw.js | head -3 || true
echo "simulate-github-pages-ci: OK"
