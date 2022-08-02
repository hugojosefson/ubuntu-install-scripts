import { stringifyYaml } from "../../deps.ts";

export const tmuxinatorBaseYml = stringifyYaml({
  "name": "base",
  "tmux_command": "byobu-tmux",
  "windows": [
    {
      "code": "cd ~/code && ll -laF",
    },
    {
      "top": "top",
    },
    {
      "": `
(
set -euo pipefail; IFS=$'\\t\\n';

hr() {
  printf '\\n---------------------------------------------------------------------\\n'
};

_if() {
  local command
  command="\${1}"
  if [[ "\${command}" = "sudo" ]]; then
    command="\${2}"
  fi
  if command -v "\${command}" >/dev/null; then
    "\${@}"
  fi
};

_if_hr() {
  local command
  command="\${1}"
  if [[ "\${command}" = "sudo" ]]; then
    command="\${2}"
  fi
  if command -v "\${command}" >/dev/null; then
    hr
    "\${@}"
  fi
};

main() {
  clear
  _if_hr sudo apt update
  _if_hr sudo apt full-upgrade -y --purge --auto-remove
  _if_hr sudo snap refresh
  _if_hr sudo flatpak update -y
  if [[ -w "$(command -v deno)" ]]; then
    _if_hr deno upgrade
  elif sudo [ -w "$(command -v deno)" ]; then
    _if_hr sudo deno upgrade
  fi
  _if_hr nvm install --lts --latest-npm
  _if_hr nvm exec --lts npm install --location=global yarn@latest
  _if_hr nvm install node --latest-npm
  _if_hr nvm exec node npm install --location=global yarn@latest
  _if_hr brew upgrade
  _if_hr rustup update
  _if_hr cargo install --locked -- $(_if cargo install --list | awk '/^[^ ]/{print $1}')
};

main
)`.trim(),
    },
  ],
});

export const tmuxinatorTempTemplate = stringifyYaml({
  "name": "${SESSION_NAME}",
  "root": "${SESSION_DIR}",
  "tmux_command": "byobu-tmux",
  "windows": [
    {
      "": "",
    },
  ],
});

export const tmuxinatorMuxYml = stringifyYaml({
  "name": "mux",
  "root": "~/.tmuxinator",
  "tmux_command": "byobu-tmux",
  "windows": [
    {
      "mux": "ls -lF",
    },
    {
      "bin": "cd ~/bin && ls -lFtr",
    },
    {
      "dotfiles": "cd ~/dotfiles && ls -lF",
    },
    {
      "mover": "byobu select-window -t :0; exit",
    },
  ],
});
