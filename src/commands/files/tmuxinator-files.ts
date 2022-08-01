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
      "":
        `( set -euo pipefail; IFS=$'\t\n'; hr() { printf '\n---------------------------------------------------------------------\n'; } ; clear && sudo apt update && hr && sudo apt full-upgrade -y --purge --auto-remove && (hr && sudo snap refresh); (hr && sudo flatpak update -y); (hr && command -v deno && (deno upgrade || sudo deno upgrade)); (hr && nvm install --lts --latest-npm && hr && nvm exec --lts npm install --location=global yarn@latest); (hr && nvm install node --latest-npm && hr && nvm exec node npm install --location=global yarn@latest); (hr && brew update) )`,
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
