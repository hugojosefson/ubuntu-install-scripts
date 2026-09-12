#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
# Mozilla publishes no general APT installer. Use its signed Release metadata
# for the suite/components, and the provider's documented key endpoint.
# https://support.mozilla.org/en-US/kb/install-firefox-linux
repository=https://packages.mozilla.org/apt
download "$repository/repo-signing-key.gpg" "$work_dir/mozilla.asc"
gpg --batch --yes --dearmor --output "$work_dir/mozilla.gpg" "$work_dir/mozilla.asc"
# Trust anchor from Mozilla's installation instructions, not a release version.
fingerprint=$(gpg --batch --show-keys --with-colons "$work_dir/mozilla.gpg" | awk -F: '$1 == "fpr" { print $10; exit }')
[[ "$fingerprint" == 35BAA0B33E9EB396F59CA838C0BA5CE6DC6315A3 ]] || { printf '%s\n' 'Mozilla signing key changed; review the provider instructions before continuing.' >&2; exit 1; }
download "$repository/dists/mozilla/InRelease" "$work_dir/InRelease"
gpgv --keyring "$work_dir/mozilla.gpg" --output "$work_dir/Release" "$work_dir/InRelease"
suite=$(sed -n 's/^Suite: //p' "$work_dir/Release")
components=$(sed -n 's/^Components: //p' "$work_dir/Release")
[[ "$suite" =~ ^[a-zA-Z0-9._-]+$ && "$components" =~ ^[a-zA-Z0-9._\ -]+$ ]] || { printf '%s\n' 'Unexpected Mozilla Release metadata.' >&2; exit 1; }
managed_file /etc/apt/keyrings/packages.mozilla.org.asc <"$work_dir/mozilla.asc"
managed_file /etc/apt/sources.list.d/mozilla.sources <<EOF
Types: deb
URIs: $repository
Suites: $suite
Components: $components
Signed-By: /etc/apt/keyrings/packages.mozilla.org.asc
EOF
# Retire only the old source file for this same provider, preserving a backup.
if [[ -f /etc/apt/sources.list.d/mozilla.list ]]; then
    mv --backup=numbered /etc/apt/sources.list.d/mozilla.list /etc/apt/sources.list.d/mozilla.list.ubuntu-install-scripts.bak
fi
managed_file /etc/apt/preferences.d/mozilla <<'EOF'
Package: *
Pin: origin packages.mozilla.org
Pin-Priority: 1001

Package: firefox
Pin: release o=Ubuntu
Pin-Priority: -1
EOF
apt-get update
apt_install --allow-downgrades firefox
test -x /usr/lib/firefox/firefox
if [[ -L /usr/local/bin/firefox && "$(readlink -f /usr/local/bin/firefox)" == "${UBUNTU_INSTALL_HOME:?}/.local/share/firefox/firefox" ]]; then
    mv --backup=numbered /usr/local/bin/firefox /usr/local/bin/firefox.ubuntu-install-scripts.bak
    ln -s /usr/bin/firefox /usr/local/bin/firefox
fi
if command -v snap >/dev/null && snap list firefox >/dev/null 2>&1; then
    # Keep Snap's automatic data snapshot. Never purge the user's browser data.
    snap remove firefox
fi
