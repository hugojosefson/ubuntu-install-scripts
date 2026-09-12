#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
managed_file /etc/apt/preferences.d/ubuntu-install-scripts-no-snap <<'EOF'
Package: snapd chromium-browser chromium-chromedriver
Pin: release o=Ubuntu
Pin-Priority: -1

Package: firefox
Pin: release o=Ubuntu
Pin-Priority: -1
EOF
apt-get update
apt_install ca-certificates curl gnupg gpgv jq git unzip xz-utils bzip2
