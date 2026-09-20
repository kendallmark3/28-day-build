#!/usr/bin/env bash
cd "$(dirname "$0")/reference-final" && python3 -m http.server 8080
