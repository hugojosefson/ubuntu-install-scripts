#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
applications_dir="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
icons_dir="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor"
config_dir="${XDG_CONFIG_HOME:-$HOME/.config}"
foot_bin=$(readlink -f "$(command -v foot)")
foot_prefix=$(dirname "$(dirname "$foot_bin")")
for icon in 48x48/apps/foot.png scalable/apps/foot.svg; do
    if [[ -f "$foot_prefix/share/icons/hicolor/$icon" ]]; then
        managed_file "$icons_dir/$icon" <"$foot_prefix/share/icons/hicolor/$icon"
    fi
done
managed_file "$applications_dir/foot.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Foot
GenericName=Terminal
Comment=A Wayland-native terminal emulator
Exec="$foot_bin"
TryExec=$foot_bin
Icon=foot
Terminal=false
Categories=System;TerminalEmulator;
Keywords=shell;prompt;command;commandline;
StartupNotify=true
StartupWMClass=foot
EOF
# Follow GNOME-APP-ICONS.md, independent of desktop-specific selection order.
while IFS= read -r desktop; do
    desktop=${desktop,,}
    [[ "$desktop" =~ ^[a-z0-9_-]+$ ]] || continue
    printf '%s\n' foot.desktop | managed_file "$config_dir/$desktop-xdg-terminals.list"
done < <(tr ':' '\n' <<<"${XDG_CURRENT_DESKTOP:-GNOME}")
printf '%s\n' foot.desktop | managed_file "$config_dir/xdg-terminals.list"
# Match the existing local Foot preference, while preserving custom configs.
if [[ ! -f "$config_dir/foot/foot.ini" ]]; then
    managed_file "$config_dir/foot/foot.ini" <<'EOF'
[main]
font=JetBrainsMono Nerd Font:size=11:fontfeatures=calt
EOF
fi
if ! fc-list : family | grep 'JetBrainsMono Nerd Font' >/dev/null; then
    download https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip "$work_dir/font.zip"
    mkdir -p "$HOME/.local/share/fonts/JetBrainsMono"
    unzip -qo "$work_dir/font.zip" -d "$HOME/.local/share/fonts/JetBrainsMono"
    fc-cache -f "$HOME/.local/share/fonts/JetBrainsMono"
fi
desktop-file-validate "$applications_dir/foot.desktop"
update-desktop-database "$applications_dir"
