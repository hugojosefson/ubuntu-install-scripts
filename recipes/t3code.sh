#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
download https://api.github.com/repos/pingdotgg/t3code/releases/latest "$work_dir/release.json"
asset=$(jq -ec '[.assets[] | select(.name | test("^T3-Code-[0-9.]+-x86_64\\.AppImage$"))] | if length == 1 then .[0] else error("Expected one Linux x86-64 AppImage") end' "$work_dir/release.json")
name=$(jq -er '.name' <<<"$asset")
url=$(jq -er '.browser_download_url | select(startswith("https://github.com/pingdotgg/t3code/releases/download/"))' <<<"$asset")
checksum=$(jq -er '.digest | select(test("^sha256:[a-f0-9]{64}$")) | ltrimstr("sha256:")' <<<"$asset")
appimage="$HOME/.local/opt/t3code/$name"
if [[ ! -f "$appimage" ]] || ! printf '%s  %s\n' "$checksum" "$appimage" | sha256sum --check --status >/dev/null 2>&1; then
    download "$url" "$work_dir/t3.AppImage"
    printf '%s  %s\n' "$checksum" "$work_dir/t3.AppImage" | sha256sum --check -
    install -Dm0755 "$work_dir/t3.AppImage" "$appimage"
fi
T3_APPIMAGE="$appimage" bash "$(dirname -- "${BASH_SOURCE[0]}")/t3-icons.sh"
ln -sfn "$appimage" "$HOME/.local/bin/t3code"
