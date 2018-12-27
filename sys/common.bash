function ensureInstalled {
    while (( $# != 0 )); do
        if ! isInstalled "$1"; then
            sudo apt install -y "$1"
        fi
        shift
    done
}

function isInstalled {
    if (( $# != 1 )); then
      echo "isInstalled must be called with one argument" >&2
      exit 1
    fi
    if [[ "$(dpkg-query --show -f '${status}' "$1")" == "install ok installed" ]] ; then
        return 0
    else
        return 1
    fi
}
