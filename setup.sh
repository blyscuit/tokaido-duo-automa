#!/usr/bin/env bash
# Setup + serve the Tokaido Duo Automa PWA.  Usage: ./setup.sh [--no-serve] [--port 8080]
set -e
cd "$(dirname "$0")"
PY=$(command -v python3 || command -v python || true)
[ -z "$PY" ] && { echo "Python 3 is required (https://python.org)"; exit 1; }
exec "$PY" setup.py "$@"
