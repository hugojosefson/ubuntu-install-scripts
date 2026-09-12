#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run inside the test container.' >&2; exit 1; }
./install apply firefox brave chrome docker node deno hj code signal-desktop
for package in firefox brave-browser google-chrome-stable docker-ce code signal-desktop; do
    dpkg-query -W -f='${Package} ${Version} ${Status}\n' "$package"
    [[ "$(dpkg-query -W -f='${Status}' "$package")" == 'install ok installed' ]]
done
test -x /usr/lib/firefox/firefox
if dpkg-query -W -f='${Status}' snapd 2>/dev/null | grep -q 'ok installed'; then
    printf '%s\n' 'Snap was installed unexpectedly.' >&2
    exit 1
fi
"$HOME/.deno/bin/deno" --version
"$HOME/.deno/bin/hj" --help
docker --version
docker compose version
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"
nvm exec --lts node --version
nvm exec default node --version
./install apply firefox docker
