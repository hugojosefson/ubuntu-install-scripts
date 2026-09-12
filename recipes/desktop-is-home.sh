#!/usr/bin/env bash
set -euo pipefail
desktop="$HOME/Desktop"
if [[ -L "$desktop" && "$(readlink -f "$desktop")" == "$(readlink -f "$HOME")" ]]; then
    printf '%s\n' 'Desktop already links to home.'
elif [[ -d "$desktop" && ! -L "$desktop" ]] && ! mountpoint -q "$desktop" && rmdir -- "$desktop"; then
    # rmdir refuses nonempty directories, including those with hidden files.
    # -T prevents creating a link inside a directory created concurrently.
    ln -sT . "$desktop"
    printf '%s\n' 'Linked the empty Desktop directory to home.'
else
    printf '%s\n' 'Preserved Desktop: it is missing, nonempty, a mount, or a different symlink.'
fi
