# GNOME icons for T3 Code, Foot, and Gitk

This setup gives T3 Code, Foot, and Gitk their correct GNOME icons. It also makes Ctrl-Alt-T start Foot through its GNOME application entry. Run this block as your normal user.

```bash
bash <<'SETUP_GNOME_ICONS'
set -euo pipefail
IFS=$'\n\t'

applications_dir="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
icons_dir="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor"
config_dir="${XDG_CONFIG_HOME:-$HOME/.config}"

for command_name in curl desktop-file-validate install update-desktop-database; do
    command -v "$command_name" >/dev/null || {
        printf 'Missing command: %s\n' "$command_name" >&2
        exit 1
    }
done

mkdir -p "$applications_dir" "$icons_dir/scalable/apps" "$config_dir"

# Find the newest T3 AppImage in the directories on PATH.
find_t3_appimages() {
    while IFS= read -r path_dir; do
        [[ -d "$path_dir" ]] || continue
        find "$path_dir" -maxdepth 1 -type f \
            -name 'T3-Code-*.AppImage' -perm -u+x -print
    done < <(tr ':' '\n' <<<"$PATH")
}

t3_appimage="${T3_APPIMAGE:-$(find_t3_appimages | sort -Vu | tail -n 1)}"
if [[ -z "$t3_appimage" || ! -x "$t3_appimage" ]]; then
    printf '%s\n' 'Set T3_APPIMAGE to the full path of the T3 AppImage.' >&2
    exit 1
fi
t3_appimage=$(readlink -f "$t3_appimage")
t3_dir=$(dirname "$t3_appimage")
t3_link="$t3_dir/t3"
ln -sfn "$(basename "$t3_appimage")" "$t3_link"

t3_extract_dir=$(mktemp -d /tmp/t3-appimage-icons.XXXXXX)
cleanup() {
    rm -rf -- "$t3_extract_dir"
}
trap cleanup EXIT
(
    cd "$t3_extract_dir"
    "$t3_appimage" --appimage-extract >/dev/null
)

for source_icon in \
    "$t3_extract_dir"/squashfs-root/usr/share/icons/hicolor/*/apps/t3code.png; do
    [[ -f "$source_icon" ]] || continue
    icon_size=$(basename "$(dirname "$(dirname "$source_icon")")")
    install -Dm0644 "$source_icon" "$icons_dir/$icon_size/apps/t3code.png"
done

cat >"$applications_dir/t3code.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=T3 Code
Comment=T3 Code desktop build
Exec="$t3_link" %U
TryExec=$t3_link
Icon=t3code
Terminal=false
Categories=Development;
StartupNotify=true
StartupWMClass=t3code
EOF

# Install the Foot icons from the same prefix as the Foot executable.
foot_bin=$(command -v foot || true)
if [[ -z "$foot_bin" ]]; then
    printf '%s\n' 'Foot is not on PATH.' >&2
    exit 1
fi
foot_bin=$(readlink -f "$foot_bin")
foot_prefix=$(dirname "$(dirname "$foot_bin")")
foot_icon_root="$foot_prefix/share/icons/hicolor"

for relative_icon in 48x48/apps/foot.png scalable/apps/foot.svg; do
    if [[ -f "$foot_icon_root/$relative_icon" ]]; then
        install -Dm0644 "$foot_icon_root/$relative_icon" \
            "$icons_dir/$relative_icon"
    fi
done

cat >"$applications_dir/foot.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Foot
GenericName=Terminal
Comment=A Wayland-native terminal emulator
Exec=$foot_bin
TryExec=$foot_bin
Icon=foot
Terminal=false
Categories=System;TerminalEmulator;
Keywords=shell;prompt;command;commandline;
StartupNotify=true
StartupWMClass=foot
EOF

# Match Gitk windows that report WM_CLASS=("gitk", "Gitk").
gk_bin=$(command -v gk || true)
if [[ -z "$gk_bin" ]]; then
    printf '%s\n' 'gk is not on PATH.' >&2
    exit 1
fi

# Official Git logomark, licensed under CC BY 3.0.
curl -fsSL \
    https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg \
    -o "$icons_dir/scalable/apps/gitk.svg"

cat >"$applications_dir/gitk.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Gitk
Comment=Git repository browser
Exec=$gk_bin
TryExec=$gk_bin
Icon=gitk
Terminal=false
Categories=Development;RevisionControl;
StartupNotify=false
StartupWMClass=Gitk
NoDisplay=true
EOF

# Make Foot the preferred terminal for xdg-terminal-exec.
desktop_names="${XDG_CURRENT_DESKTOP:-GNOME}"
while IFS= read -r desktop_name; do
    desktop_name=$(printf '%s' "$desktop_name" | tr '[:upper:]' '[:lower:]')
    [[ -n "$desktop_name" ]] || continue
    printf '%s\n' foot.desktop >"$config_dir/$desktop_name-xdg-terminals.list"
done < <(tr ':' '\n' <<<"$desktop_names")
printf '%s\n' foot.desktop >"$config_dir/xdg-terminals.list"

desktop-file-validate \
    "$applications_dir/t3code.desktop" \
    "$applications_dir/foot.desktop" \
    "$applications_dir/gitk.desktop"
update-desktop-database "$applications_dir"

if [[ -f /usr/share/icons/hicolor/index.theme && \
      ! -f "$icons_dir/index.theme" ]]; then
    install -m0644 /usr/share/icons/hicolor/index.theme "$icons_dir/index.theme"
fi
if command -v gtk-update-icon-cache >/dev/null && \
   [[ -f "$icons_dir/index.theme" ]]; then
    gtk-update-icon-cache -f -t "$icons_dir"
fi

printf '%s\n' 'GNOME launchers and icons are ready.'
SETUP_GNOME_ICONS
```

Run this block to make sure that GNOME selects the new files. Close and reopen each application after the test. Existing windows keep their old icon association.

```bash
printf 't3: %s -> %s\n' "$(command -v t3)" "$(readlink -f "$(command -v t3)")"
printf 'terminal desktop ID: '
xdg-terminal-exec --print-id
printf 'terminal command: '
xdg-terminal-exec --print-cmd | paste -sd ' ' -
desktop-file-validate \
    ~/.local/share/applications/t3code.desktop \
    ~/.local/share/applications/foot.desktop \
    ~/.local/share/applications/gitk.desktop
```

These files contain the persistent configuration. Copy them to the same paths on another machine. Adjust the executable paths in the desktop files when the installation paths differ.

```text
~/.local/bin/t3
~/.local/share/applications/t3code.desktop
~/.local/share/applications/foot.desktop
~/.local/share/applications/gitk.desktop
~/.local/share/icons/hicolor/*/apps/t3code.png
~/.local/share/icons/hicolor/48x48/apps/foot.png
~/.local/share/icons/hicolor/scalable/apps/foot.svg
~/.local/share/icons/hicolor/scalable/apps/gitk.svg
~/.config/*-xdg-terminals.list
~/.config/xdg-terminals.list
```

Do not copy `mimeinfo.cache` or `icon-theme.cache`. The setup block creates these cache files again.
