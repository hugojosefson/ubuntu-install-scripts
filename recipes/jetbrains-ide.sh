#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
product=$1 tool_id=$2
download "https://data.services.jetbrains.com/products/releases?code=$product&latest=true&type=release" "$work_dir/releases.json"
build=$(jq -er --arg product "$product" '.[$product][0].build | select(test("^[0-9.]+$"))' "$work_dir/releases.json")
toolbox_list() {
    "$HOME/.local/bin/tbcli" list --json >"$work_dir/tools.log"
    # Current tbcli writes startup messages before its JSON object.
    sed -n '/^{/,$p' "$work_dir/tools.log" | jq -e '.map | objects' >"$work_dir/tools.json"
}
is_installed() {
    jq -e --arg tool "$tool_id" --arg build "$build" \
        'any(.[]; .tool.toolId == $tool and .tool.buildNumber == $build and .channel.history.source == "InstalledByUser")' "$work_dir/tools.json" >/dev/null
}
toolbox_list
if is_installed; then
    printf '%s %s is already installed in Toolbox.\n' "$tool_id" "$build"
    exit 0
fi
# Toolbox owns the installation, updates, application metadata, and launchers.
"$HOME/.local/bin/tbcli" install "$tool_id" "$build" --verbose
toolbox_list
is_installed || { printf '%s\n' 'Toolbox did not report the requested installation.' >&2; exit 1; }
