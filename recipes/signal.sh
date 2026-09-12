#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
download https://updates.signal.org/desktop/apt/keys.asc "$work_dir/signal.asc"
gpg --batch --yes --dearmor --output "$work_dir/signal.gpg" "$work_dir/signal.asc"
download https://updates.signal.org/static/desktop/apt/signal-desktop.sources "$work_dir/signal.sources"
grep -q '^URIs: https://updates.signal.org/desktop/apt' "$work_dir/signal.sources"
grep -q '^Signed-By: /usr/share/keyrings/signal-desktop-keyring.gpg' "$work_dir/signal.sources"
managed_file /usr/share/keyrings/signal-desktop-keyring.gpg <"$work_dir/signal.gpg"
managed_file /etc/apt/sources.list.d/signal-desktop.sources <"$work_dir/signal.sources"
if [[ -f /etc/apt/sources.list.d/signal-desktop.list ]]; then
    mv --backup=numbered /etc/apt/sources.list.d/signal-desktop.list /etc/apt/sources.list.d/signal-desktop.list.ubuntu-install-scripts.bak
fi
apt-get update
apt_install signal-desktop
