#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
run_provider https://github.com/passff/passff-host/releases/latest/download/install_host_app.sh bash firefox
