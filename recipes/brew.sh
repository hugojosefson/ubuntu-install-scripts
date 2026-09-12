#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
export NONINTERACTIVE=1
if [[ -x /home/linuxbrew/.linuxbrew/bin/brew ]]; then
    /home/linuxbrew/.linuxbrew/bin/brew update
else
    run_provider https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh bash
fi
managed_file "$HOME/.config/ubuntu-install-scripts/homebrew.sh" <<'EOF'
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
EOF
