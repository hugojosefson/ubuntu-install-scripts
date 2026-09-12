#!/usr/bin/env bash
set -eo pipefail
# SDKMAN's initialization is not compatible with nounset.
# shellcheck disable=SC1091
source "${SDKMAN_DIR:-$HOME/.sdkman}/bin/sdkman-init.sh"
sdk install java
