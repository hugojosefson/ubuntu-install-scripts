#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run ./test/check to test in Docker.' >&2; exit 1; }
deno task check
shellcheck -x install recipes/*.sh test/check test/*.sh settings_diff
