#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
data_dir="${XDG_DATA_HOME:-$HOME/.local/share}"
find_t3_appimages() {
    local path_dir
    while IFS= read -r path_dir; do
        [[ -d "$path_dir" ]] || continue
        find "$path_dir" -maxdepth 1 -type f -name 'T3-Code-*.AppImage' -perm -u+x -print
    done < <(tr ':' '\n' <<<"$PATH")
}
appimage="${T3_APPIMAGE:-$(find_t3_appimages | sort -Vu | tail -n 1)}"
[[ -n "$appimage" && -x "$appimage" ]] || { printf '%s\n' 'Set T3_APPIMAGE to an existing executable T3 Code AppImage.' >&2; exit 1; }
appimage=$(readlink -f "$appimage")
mkdir -p "$HOME/.local/bin"
ln -sfn "$appimage" "$HOME/.local/bin/t3"
(cd "$work_dir"; "$appimage" --appimage-extract >/dev/null)
found=false
for icon in "$work_dir"/squashfs-root/usr/share/icons/hicolor/*/apps/t3code.png; do
    [[ -f "$icon" ]] || continue
    size=$(basename "$(dirname "$(dirname "$icon")")")
    managed_file "$data_dir/icons/hicolor/$size/apps/t3code.png" <"$icon"
    found=true
done
[[ "$found" == true ]] || { printf '%s\n' 'No T3 Code icons found in the AppImage.' >&2; exit 1; }
managed_file "$data_dir/applications/t3code.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=T3 Code
Comment=T3 Code desktop build
Exec="$HOME/.local/bin/t3" %U
TryExec=$HOME/.local/bin/t3
Icon=t3code
Terminal=false
Categories=Development;
StartupNotify=true
StartupWMClass=t3code
EOF
desktop-file-validate "$data_dir/applications/t3code.desktop"
update-desktop-database "$data_dir/applications"
