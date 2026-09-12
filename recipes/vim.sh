#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
managed_file "$HOME/.local/bin/vim" 0755 <<'EOF'
#!/bin/sh
exec nvim "$@"
EOF
managed_file "$HOME/.config/ubuntu-install-scripts/editor.sh" <<'EOF'
export EDITOR=nvim
export VISUAL=nvim
EOF
managed_file "${XDG_CONFIG_HOME:-$HOME/.config}/environment.d/60-ubuntu-install-scripts-editor.conf" <<'EOF'
EDITOR=nvim
VISUAL=nvim
EOF
