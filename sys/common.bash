export true=0
export false=1

function ensureInstalled() {
  while (( $# != 0 )); do
    if ! isInstalled "$1"; then
      sudo dnf install -y "$1"
    fi
    shift
  done
}

function isInstalled() {
  if (( $# != 1 )); then
    echo "isInstalled must be called with one argument" >&2
    exit 1
  fi
  [[ $(dnf repoquery --installed "$1" ) ]]
}

function insideDocker() {
  [[ -e "/.dockerenv" ]] && return ${true}
  [[ -e "/proc/self/cgroup" ]] && (grep docker /proc/self/cgroup >/dev/null) && return ${true}
  return ${false}
}
