#!/bin/sh

set -e

exec /tmp/deno-range-^1.8/bin/deno run -A --unstable --inspect-brk src/cli.ts "$@"
