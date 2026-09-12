#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
download https://api.github.com/repos/nvm-sh/nvm/releases/latest "$work_dir/release.json"
tag=$(jq -er '.tag_name | select(test("^v[0-9]+\\.[0-9]+\\.[0-9]+$"))' "$work_dir/release.json")
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
mkdir -p "$NVM_DIR"
export PROFILE=/dev/null
run_provider "https://raw.githubusercontent.com/nvm-sh/nvm/$tag/install.sh" bash
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"
[[ "${1:-}" == nvm-only ]] && exit 0
nvm install --lts --latest-npm
# nvm install activates the selected version in this shell. Use that executable
# directly instead of resolving nvm's moving 'node' alias again.
npm install --location=global yarn@latest
nvm install node --latest-npm
npm install --location=global yarn@latest
nvm alias default "$(node --version)"
