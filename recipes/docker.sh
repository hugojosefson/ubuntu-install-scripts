#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
if dpkg-query -W -f='${Status}' docker-ce 2>/dev/null | grep -q 'ok installed'; then
    apt-get update
    apt_install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    run_provider https://get.docker.com sh
fi
usermod -aG docker "${UBUNTU_INSTALL_USER:?}"
printf '%s\n' 'Log in again to use the docker group. It grants administrative access.'
