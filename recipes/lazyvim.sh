#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
config="${XDG_CONFIG_HOME:-$HOME/.config}/nvim"
if [[ ! -e "$config" && ! -L "$config" ]]; then
    git clone --depth=1 https://github.com/LazyVim/starter "$work_dir/starter"
    # Upstream recommends removing the template's Git history.
    rm -rf -- "$work_dir/starter/.git"
    mkdir -p "$(dirname "$config")"
    mv -T "$work_dir/starter" "$config"
elif [[ ! -d "$config/lua" ]] || ! rg -q 'LazyVim/LazyVim' "$config/lua"; then
    printf 'Preserved existing Neovim configuration at %s. It is not a recognized LazyVim setup.\n' "$config" >&2
    exit 1
fi
# Mason and plugin builds must use the Node installed by the dependency recipe.
set +u
# shellcheck disable=SC1091
source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
set -u
export UBUNTU_INSTALL_LAZYVIM_SCRIPT
UBUNTU_INSTALL_LAZYVIM_SCRIPT="$(realpath "$(dirname -- "${BASH_SOURCE[0]}")/lazyvim-install.lua")"
# A separate process loads newly updated plugin code before installing tools.
UBUNTU_INSTALL_LAZYVIM_PHASE=sync nvim --headless '+lua dofile(vim.env.UBUNTU_INSTALL_LAZYVIM_SCRIPT)'
nvim --headless '+lua dofile(vim.env.UBUNTU_INSTALL_LAZYVIM_SCRIPT)'
