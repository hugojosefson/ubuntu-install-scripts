#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
mkdir -p "$HOME/.local/bin" "$HOME/.config/ubuntu-install-scripts"
managed_file "$HOME/.config/ubuntu-install-scripts/bash.sh" <<'EOF'
# Managed by ubuntu-install-scripts.
for tool_dir in "$HOME/.local/bin" "$HOME/bin" "$HOME/.deno/bin" "$HOME/.cargo/bin"; do
    case ":$PATH:" in *":$tool_dir:"*) ;; *) export PATH="$tool_dir:$PATH" ;; esac
done
unset tool_dir
[[ ! -r "$HOME/.config/ubuntu-install-scripts/homebrew.sh" ]] || source "$HOME/.config/ubuntu-install-scripts/homebrew.sh"
[[ ! -r "$HOME/.config/ubuntu-install-scripts/editor.sh" ]] || source "$HOME/.config/ubuntu-install-scripts/editor.sh"
# SDKMAN and nvm read optional unset variables during initialization.
ubuntu_install_restore_nounset=false
case $- in *u*) ubuntu_install_restore_nounset=true; set +u ;; esac
export SDKMAN_DIR="${SDKMAN_DIR:-$HOME/.sdkman}"
[[ ! -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]] || source "$SDKMAN_DIR/bin/sdkman-init.sh"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[[ ! -s "$NVM_DIR/nvm.sh" ]] || source "$NVM_DIR/nvm.sh"
[[ ! -s "$NVM_DIR/bash_completion" ]] || source "$NVM_DIR/bash_completion"
if [[ "$ubuntu_install_restore_nounset" == true ]]; then set -u; fi
unset ubuntu_install_restore_nounset
if [[ $- == *i* ]]; then
    shopt -s histappend
    HISTSIZE=100000
    HISTFILESIZE=1000000
    if command -v starship >/dev/null; then eval "$(starship init bash)"; fi
    if [[ "${PROMPT_COMMAND[*]:-}" != *'history -a'* ]]; then
        PROMPT_COMMAND+=( 'history -a' )
    fi
fi
EOF
# shellcheck disable=SC2016 # This line expands HOME when the user's shell starts.
line='[[ ! -r "$HOME/.config/ubuntu-install-scripts/bash.sh" ]] || source "$HOME/.config/ubuntu-install-scripts/bash.sh"'
if ! grep -Fqx "$line" "$HOME/.bashrc" 2>/dev/null; then
    [[ ! -e "$HOME/.bashrc" ]] || cp --backup=numbered "$HOME/.bashrc" "$HOME/.bashrc.ubuntu-install-scripts.bak"
    printf '\n%s\n' "$line" >>"$HOME/.bashrc"
fi
