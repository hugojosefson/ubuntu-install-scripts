#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
sdkman_dir="${SDKMAN_DIR:-$HOME/.sdkman}"
if [[ -s "$sdkman_dir/bin/sdkman-init.sh" ]]; then
    set +u
    # shellcheck disable=SC1091
    source "$sdkman_dir/bin/sdkman-init.sh"
    sdk selfupdate
else
    run_provider 'https://get.sdkman.io/?ci=true' bash
fi
