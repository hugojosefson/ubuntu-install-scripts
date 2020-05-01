export true=0
export false=1

function ensureInstalled() {
  while (( $# != 0 )); do
    if ! isInstalled "$1"; then
      sudo env DEBIAN_FRONTEND=noninteractive apt-get install -y "$1"
    fi
    shift
  done
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
  cat /etc/lsb-release | awk -F '=' '/DISTRIB_CODENAME/{print $2}'
}
