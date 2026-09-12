#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run inside the test container.' >&2; exit 1; }
./install apply bootstrap
mapfile -t packages < <(./install list --json | jq -r '[.[] | .packages // [] | .[]] | unique[]')
sudo apt-get --simulate install -y --no-install-recommends "${packages[@]}"
