#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

exec deno run -A --unstable --inspect-brk src/cli.ts "$@"
