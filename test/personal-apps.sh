#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run ./test/check bash test/personal-apps.sh.' >&2; exit 1; }
./install apply keybase mullvad
dpkg-query -W -f='${Package} ${Version} ${Status}\n' keybase mullvad-vpn
keybase version
mullvad --version
# Account login and VPN connectivity require a desktop VM and user credentials.
