#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run inside the test container.' >&2; exit 1; }
./install apply foot gitk starship
[[ "$(xdg-terminal-exec --print-id)" == foot.desktop ]]
desktop-file-validate "$HOME/.local/share/applications/foot.desktop" "$HOME/.local/share/applications/gitk.desktop"
foot --version
"$HOME/.local/bin/starship" --version
./install apply foot gitk
