#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
case "$(dpkg --print-architecture)" in
    amd64) platform=linux-deb-x64 ;;
    arm64) platform=linux-deb-arm64 ;;
    *) exit 1 ;;
esac
# The DEB owns the Microsoft repository setup; keep that logic with Microsoft.
printf '%s\n' 'code code/add-microsoft-repo boolean true' | debconf-set-selections
install_deb "https://update.code.visualstudio.com/latest/$platform/stable" code
