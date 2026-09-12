#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
case "$(dpkg --print-architecture)" in
    amd64) package_format=deb ;;
    arm64) package_format=arm-deb ;;
    *) exit 1 ;;
esac
install_deb "https://mullvad.net/en/download/app/$package_format/latest" mullvad-vpn
