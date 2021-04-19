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
      "": "clear && sudo pacman --sync --refresh --needed --sysupgrade",
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
