#!/usr/bin/env bash
set -euo pipefail
[[ -f /.dockerenv ]] || { printf '%s\n' 'Run ./test/check bash test/t3code.sh.' >&2; exit 1; }
./install apply t3code
work_dir=$(mktemp -d)
trap 'rm -rf -- "$work_dir"' EXIT
(cd "$work_dir" && "$HOME/.local/bin/t3code" --appimage-extract >/dev/null)
ldd "$work_dir/squashfs-root/t3code" >"$work_dir/libraries"
if grep -F 'not found' "$work_dir/libraries"; then
    printf '%s\n' 'T3 Code has missing runtime libraries.' >&2
    exit 1
fi
desktop-file-validate "$HOME/.local/share/applications/t3code.desktop"
test "$(readlink -f "$HOME/.local/bin/t3")" = "$(readlink -f "$HOME/.local/bin/t3code")"
./install apply t3code
