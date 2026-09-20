#!/bin/bash
# Runs every check suite in this folder against the running app and prints failures plus totals.
# Needs: Node 18+, Google Chrome (or CHROME_PATH), and puppeteer-core (npm install puppeteer-core, or NODE_PATH pointing at it).
# Start the app first, for example:  python3 -m http.server 8092 --directory app   (from the repository root)
cd "$(dirname "$0")" || exit 1
tot=0; pass=0
for f in regression.js day*.js; do
  [ -f "$f" ] || continue
  out=$(node "$f" 2>&1)
  echo "$out" | grep -E "^FAIL|SCRIPT ERROR" | cut -c1-300
  p=$(echo "$out" | grep -c "^PASS"); sk=$(echo "$out" | grep -c "^SKIP"); [ "$sk" != "0" ] && echo "   ($sk skipped: see SKIP lines)"; fl=$(echo "$out" | grep -c "^FAIL")
  echo "== $f: $p pass, $fl fail"
  pass=$((pass+p)); tot=$((tot+p+fl))
done
echo "TOTAL $pass/$tot"
