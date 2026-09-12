#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run this test in Docker with --network none.' >&2; exit 1; }
# shellcheck disable=SC1091
source "$HOME/.config/ubuntu-install-scripts/bash.sh"
test "$EDITOR" = nvim
test "$VISUAL" = nvim
vim --version | sed -n '1p'
timeout 60 strace -f -e trace=execve -o /tmp/editor-exec.log \
    nvim --headless '+lua dofile("test/editor-offline.lua")'
if grep -E 'execve\([^,]*/(curl|wget|npm|cc|gcc|make|tree-sitter)"|execve\([^,]*/git".*"(fetch|clone|pull)"' /tmp/editor-exec.log; then
    printf '%s\n' 'Editor startup attempted a download, installation, or parser build.' >&2
    exit 1
fi
