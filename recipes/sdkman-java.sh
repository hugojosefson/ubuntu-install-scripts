#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
# SDKMAN's initialization is not compatible with nounset.
set +u
# shellcheck disable=SC1091
source "${SDKMAN_DIR:-$HOME/.sdkman}/bin/sdkman-init.sh"
# Use the same recommendation endpoint as SDKMAN's supplied install function.
download "${SDKMAN_CANDIDATES_API}/candidates/default/java" "$work_dir/java-version"
java_version=$(cat "$work_dir/java-version")
[[ "$java_version" =~ ^[a-zA-Z0-9][a-zA-Z0-9.+_-]*$ ]] || exit 1
export sdkman_auto_answer=true
sdk install java "$java_version"
sdk default java "$java_version"
"${SDKMAN_CANDIDATES_DIR}/java/current/bin/java" -version
