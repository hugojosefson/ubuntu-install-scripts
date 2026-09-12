#!/usr/bin/env bash
# Shared by recipes. These functions are only called during an explicit apply.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
work_dir=$(mktemp -d)
trap 'rm -rf -- "$work_dir"' EXIT

download() {
    curl --proto '=https' --proto-redir '=https' --tlsv1.2 --fail --show-error --silent --location \
        --retry 3 --connect-timeout 20 --max-time 900 --speed-time 60 --speed-limit 1024 "$1" -o "$2"
    test -s "$2"
}

apt_install() {
    apt-get install -y --no-install-recommends "$@"
}

# Save the previous contents when a managed file actually changes.
managed_file() {
    local destination=$1 mode=${2:-0644} incoming
    incoming=$(mktemp "$work_dir/file.XXXXXX")
    cat >"$incoming"
    if [[ -f "$destination" ]] && cmp -s "$incoming" "$destination"; then
        return
    fi
    if [[ -e "$destination" || -L "$destination" ]]; then
        cp --backup=numbered -- "$destination" "$destination.ubuntu-install-scripts.bak"
    fi
    install -D -m "$mode" "$incoming" "$destination"
}

run_provider() {
    local url=$1 interpreter=$2
    shift 2
    download "$url" "$work_dir/provider.sh"
    printf 'Provider installer: %s\n' "$url"
    sha256sum "$work_dir/provider.sh"
    (cd "$work_dir" && "$interpreter" "$work_dir/provider.sh" "$@")
}

install_deb() {
    local url=$1 package=$2 actual architecture
    download "$url" "$work_dir/package.deb"
    actual=$(dpkg-deb -f "$work_dir/package.deb" Package)
    [[ "$actual" == "$package" ]] || { printf 'Expected %s, downloaded %s\n' "$package" "$actual" >&2; return 1; }
    architecture=$(dpkg-deb -f "$work_dir/package.deb" Architecture)
    [[ "$architecture" == all || "$architecture" == "$(dpkg --print-architecture)" ]] || { printf 'Unexpected package architecture: %s\n' "$architecture" >&2; return 1; }
    chmod 0755 "$work_dir"
    chmod 0644 "$work_dir/package.deb"
    apt_install "$work_dir/package.deb"
}
