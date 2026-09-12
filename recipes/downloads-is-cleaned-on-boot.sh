#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
user_name=${UBUNTU_INSTALL_USER:?Run through ./install apply.}
user_home=$(realpath -e -- "${UBUNTU_INSTALL_HOME:?Run through ./install apply.}")
user_id=$(id -u "$user_name")
group_id=$(id -g "$user_name")
[[ "$user_id" != 0 && "$user_home" != / ]] || exit 1
downloads="$user_home/Downloads"
config="/etc/tmpfiles.d/ubuntu-install-scripts-downloads-$user_id.conf"

# Quote paths using the escapes supported by tmpfiles.d, including literal %.
escaped=${downloads//\\/\\\\}
escaped=${escaped//\"/\\\"}
escaped=${escaped//%/%%}
escaped=${escaped//$'\n'/\\n}
escaped=${escaped//$'\r'/\\r}
escaped=${escaped//$'\t'/\\t}
printf '# Managed by ubuntu-install-scripts. Enabled only while Downloads was empty.\nD! "%s" - %s %s -\n' "$escaped" "$user_id" "$group_id" >"$work_dir/downloads.conf"
if cmp -s "$config" "$work_dir/downloads.conf"; then
    printf '%s\n' 'Downloads cleanup is already enabled; no files were deleted now.'
    exit 0
fi
if [[ ! -d "$downloads" || -L "$downloads" ]] || mountpoint -q "$downloads" || [[ "$(stat -c %u "$downloads")" != "$user_id" ]]; then
    printf '%s\n' 'Preserved Downloads: cleanup requires an existing directory owned by you, without a symlink or mount.'
    exit 0
fi
shopt -s nullglob dotglob
contents=("$downloads"/*)
if ((${#contents[@]})); then
    printf '%s\n' 'Preserved Downloads: it is not empty, so automatic cleanup was not enabled.'
    exit 0
fi
managed_file "$config" <"$work_dir/downloads.conf"
printf '%s\n' 'Enabled Downloads cleanup at future boots. No files were deleted now.'
