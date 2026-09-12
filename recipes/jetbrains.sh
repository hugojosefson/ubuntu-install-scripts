#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/lib.sh"
product=$1 command_name=$2 display_name=$3
case "$(uname -m)" in
    x86_64) platform=linux ;;
    aarch64) platform=linuxARM64 ;;
    *) exit 1 ;;
esac
download "https://data.services.jetbrains.com/products/releases?code=$product&latest=true&type=release" "$work_dir/releases.json"
url=$(jq -er --arg product "$product" --arg platform "$platform" '.[$product][0].downloads[$platform].link | select(startswith("https://download.jetbrains.com/"))' "$work_dir/releases.json")
checksum_url=$(jq -er --arg product "$product" --arg platform "$platform" '.[$product][0].downloads[$platform].checksumLink | select(startswith("https://download.jetbrains.com/"))' "$work_dir/releases.json")
build=$(jq -er --arg product "$product" '.[$product][0].build | select(test("^[0-9.]+$"))' "$work_dir/releases.json")
destination="$HOME/.local/opt/jetbrains/$command_name-$build"
if [[ ! -f "$destination/.complete" ]] || ! [[ -x "$destination/bin/$command_name" || -x "$destination/bin/$command_name.sh" || -x "$destination/$command_name" ]]; then
    download "$url" "$work_dir/app.tar.gz"
    download "$checksum_url" "$work_dir/app.sha256"
    checksum=$(awk 'NR == 1 { print $1 }' "$work_dir/app.sha256")
    [[ "$checksum" =~ ^[[:xdigit:]]{64}$ ]]
    printf '%s  %s\n' "$checksum" "$work_dir/app.tar.gz" | sha256sum --check -
    mkdir -p "$destination"
    tar -xzf "$work_dir/app.tar.gz" --strip-components=1 -C "$destination"
fi
binary="$destination/bin/$command_name"
[[ -x "$binary" ]] || binary="$destination/bin/$command_name.sh"
[[ -x "$binary" ]] || binary="$destination/$command_name"
test -x "$binary"
touch "$destination/.complete"
mkdir -p "$HOME/.local/bin"
ln -sfn "$binary" "$HOME/.local/bin/$command_name"
icon="$destination/bin/$command_name.svg"
[[ -f "$icon" ]] || icon="$destination/bin/$command_name.png"
[[ -f "$icon" ]] || icon=applications-development
managed_file "$HOME/.local/share/applications/$command_name.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=$display_name
Exec="$HOME/.local/bin/$command_name" %F
Icon=$icon
Terminal=false
Categories=Development;IDE;
StartupNotify=true
EOF
desktop-file-validate "$HOME/.local/share/applications/$command_name.desktop"
update-desktop-database "$HOME/.local/share/applications"
