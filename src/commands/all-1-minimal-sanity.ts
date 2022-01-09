import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { bash } from "./bash.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { desktopIsHome } from "./desktop-is-home.ts";
import { downloadsIsTmp } from "./downloads-is-tmp.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { tmuxinatorByobuBashAliases } from "./tmuxinator_byobu_bash_aliases.ts";
import { vim } from "./vim.ts";
import { starship } from "./starship.ts";

export const all1MinimalSanity = Command.custom()
  .withDependencies([
    ...[
      "bash-completion",
      "bmenu",
      "dos2unix",
      "jq",
      "man-db",
      "man-pages",
      "ncdu",
      "networkmanager-openvpn",
      "openssh",
      "pamac",
      "tree",
    ].map(InstallOsPackage.of),
    bash,
    vim,
    starship,
    saveBashHistory,
    desktopIsHome,
    downloadsIsTmp,
    addHomeBinToPath,
    tmuxinatorByobuBashAliases,
  ]);
