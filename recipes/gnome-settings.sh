#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
# These preferences were read from the local desktop; terminal choice follows
# GNOME-APP-ICONS.md. Preserve all unrelated preferences and shortcuts.
gsettings set org.gnome.desktop.interface color-scheme prefer-dark
gsettings set org.gnome.desktop.wm.preferences focus-mode click
# The built-in terminal shortcut uses the same keys. Keep one handler for them.
gsettings set org.gnome.settings-daemon.plugins.media-keys terminal '[]'
shortcut_path=/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/ubuntu-install-scripts-terminal/
shortcut_schema="org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:$shortcut_path"
gsettings set "$shortcut_schema" name 'Foot terminal'
gsettings set "$shortcut_schema" command 'gtk-launch foot'
gsettings set "$shortcut_schema" binding '<Control><Alt>t'
# GLib handles GVariant parsing and serialization, including existing shortcuts.
python3 - "$shortcut_path" <<'PY'
import sys
from gi.repository import Gio
settings = Gio.Settings.new('org.gnome.settings-daemon.plugins.media-keys')
paths = list(settings.get_strv('custom-keybindings'))
if sys.argv[1] not in paths:
    settings.set_strv('custom-keybindings', paths + [sys.argv[1]])
Gio.Settings.sync()
PY
