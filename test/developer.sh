#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run ./test/check bash test/developer.sh.' >&2; exit 1; }
./install apply vim lazyvim java jetbrains-toolbox idea webstorm gh t3code
set +u
# shellcheck disable=SC1091
source "$HOME/.config/ubuntu-install-scripts/bash.sh"
set -u
test "$EDITOR" = nvim
test "$VISUAL" = nvim
vim --version | sed -n '1p'
java -version
test "$JAVA_HOME" = "$HOME/.sdkman/candidates/java/current"
gh --version
test -x "$HOME/.local/bin/t3code"
desktop-file-validate "$HOME/.local/share/applications/t3code.desktop"
./install apply java idea webstorm t3code
# Repeat provisioning must preserve custom Neovim files.
printf '%s\n' '-- existing customization' >"$HOME/.config/nvim/lua/plugins/keep.lua"
printf '%s\n' 'return {}' >>"$HOME/.config/nvim/lua/plugins/keep.lua"
./install apply lazyvim
grep -q 'existing customization' "$HOME/.config/nvim/lua/plugins/keep.lua"
