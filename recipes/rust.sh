#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
if [[ -x "$HOME/.cargo/bin/rustup" ]]; then
    "$HOME/.cargo/bin/rustup" update
else
    run_provider https://sh.rustup.rs sh -y --no-modify-path
fi
