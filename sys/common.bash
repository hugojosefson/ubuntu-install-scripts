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

export true=0
export false=1

function ensureInstalled() {
  while (( $# != 0 )); do
    local packageOrUrl="${1}"
    if isUrl "${packageOrUrl}"; then
      ensureInstalledUrl "${packageOrUrl}"
    else
      ensureInstalledPackage "${packageOrUrl}"
    fi
    shift
  done
}

function isUrl() {
  echo "${1}" | grep / >/dev/null
}

function ensureInstalledUrl() {
  local url="${1}"
  local filename="$(basename "${url}")"
  ensureInstalled gdebi wget
  cd "$(mktemp -d)"
  wget -O "${filename}" "${url}"
  sudo gdebi --non-interactive "${filename}"
}

function ensureInstalledPackage() {
  local package="${1}"
  if ! isInstalled "${package}"; then
    sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y "${package}"
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
  if [[ "$(dpkg-query --show -f '${status}' "$1" 2>/dev/null)" == "install ok installed" ]] ; then
    return 0
  else
    return 1
  fi
}

function insideDocker() {
  [[ -e "/.dockerenv" ]] && return ${true}
  [[ -e "/proc/self/cgroup" ]] && (grep docker /proc/self/cgroup >/dev/null) && return ${true}
  return ${false}
}

function ubuntuCodename() {
  ensureInstalled lsb-release
  lsb_release -cs
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

function existsAptRepo() {
  local repo="${1}"
  local dist="${2:-"$(ubuntuCodename)"}"
  existsUrl "${repo}/dists/${dist}/Release"
}
