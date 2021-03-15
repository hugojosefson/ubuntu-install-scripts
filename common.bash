#!/usr/bin/env bash
(return 2>/dev/null) && isSourced=1 || isSourced=0
CURRENT_SCRIPT="${BASH_SOURCE[0]}"

if ! ((isSourced)); then
  if [[ $# -eq 0 ]]; then
    echo "${CURRENT_SCRIPT} should be sourced from bash scripts, to set up functions." >&2
    echo "Alternatively, you may execute ${CURRENT_SCRIPT} with arguments directly, and it will execute those arguments (which may be functions from this file). For example: ${CURRENT_SCRIPT} ensureInstalled curl" >&2
    exit 1
  fi
  . "${CURRENT_SCRIPT}"
  "$@"
  exit $?
fi

set -o errexit -o nounset -o pipefail

function ensureInstalled() {
  while (( $# != 0 )); do
    local package="${1}"
    ensureInstalledPackage "${package}"
    shift
  done
}

function installAurPackage() {
  ./install-rua
  if insideDocker; then
    su - user rua install "${@}"
  else
    rua install "${@}"
  fi
}

function ensureUninstalled() {
  while (( $# != 0 )); do
    local package="${1}"
    ensureUninstalledPackage "${package}"
    shift
  done
}

function ensureInstalledPackage() {
  local package="${1}"
  if ! isInstalled "${package}"; then
    $SUDO pacman -Sy --noconfirm --needed "${package}"
  fi
}

function ensureUninstalledPackage() {
  local package="${1}"
  if isInstalled "${package}"; then
    $SUDO pacman -Rs --noconfirm "${package}"
  fi
}

function ensureInstalledFlatpak() {
  if insideDocker; then
    flatpak install --or-update --noninteractive --no-deploy "flathub" "${@}"
  else
    flatpak install --or-update --noninteractive "flathub" "${@}"
  fi
}

function isInstalled() {
  if (( $# != 1 )); then
    echo "isInstalled must be called with one argument" >&2
    exit 1
  fi
  local package="${1}"
  pacman -Qi "${package}" >/dev/null 2>&1
}

function insideDocker() {
  [[ -e "/.dockerenv" ]] && return 0
  [[ -e "/proc/self/cgroup" ]] && (grep docker /proc/self/cgroup >/dev/null) && return 0
  return 1
}

function githubDownloadUrl() {
  local repo="${1}"

  ensureInstalled curl jq
  curl -s "https://api.github.com/repos/${repo}/releases/latest" | jq -r '.assets[]|.browser_download_url' | grep linux.amd64
}

function githubDownload() {
  local repo="${1}"
  shift

  ensureInstalled curl
  curl --location --tlsv1.2 "$(githubDownloadUrl "${repo}")" "$@"
}

function existsUrl() {
  local url="${1}"
  curl -sL /dev/null --fail "${url}" >/dev/null
}

function ensureInFile() {
  local file="${1}"
  local line="${2}"

  grep -x "${line}" "${file}" && return

  echo >> "${file}"
  echo "${line}" >> "${file}"
}


if [[ $(id -u) -eq 0 ]]; then
  SUDO=""
  if insideDocker; then
    ensureInstalled sudo
    echo "user    ALL=(ALL:ALL) ALL" > /etc/sudoers.d/user
    getent passwd user >/dev/null 2>&1 || useradd --user-group --create-home user
  fi
else
  SUDO="sudo"
fi

PATH="${HOME}/.cargo/bin:${PATH}"
