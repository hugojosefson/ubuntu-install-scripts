#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
data_dir="${XDG_DATA_HOME:-$HOME/.local/share}"
if ! command -v gk >/dev/null && [[ ! -e "$HOME/.local/bin/gk" ]]; then
    managed_file "$HOME/.local/bin/gk" 0755 <<'EOF'
#!/usr/bin/env bash
if [[ $# -eq 0 ]]; then set -- --all; fi
exec gitk "$@"
EOF
fi
gk_bin=$(command -v gk || printf '%s/.local/bin/gk' "$HOME")
download https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg "$work_dir/gitk.svg"
managed_file "$data_dir/icons/hicolor/scalable/apps/gitk.svg" <"$work_dir/gitk.svg"
managed_file "$data_dir/applications/gitk.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Gitk
Comment=Git repository browser
Exec="$gk_bin"
TryExec=$gk_bin
Icon=gitk
Terminal=false
Categories=Development;RevisionControl;
StartupNotify=false
StartupWMClass=Gitk
NoDisplay=true
EOF
desktop-file-validate "$data_dir/applications/gitk.desktop"
update-desktop-database "$data_dir/applications"
