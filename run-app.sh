#!/usr/bin/env bash
# Serves the working app in app/ and prints its address. Usage: ./run-app.sh [port]   (default 8080)
PORT="${1:-8080}"
cd "$(dirname "$0")/app" || exit 1
echo "IntentWorkbench is at http://localhost:$PORT  (press Ctrl+C to stop)"
python3 -m http.server "$PORT"
