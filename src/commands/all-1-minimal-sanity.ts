import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { bash } from "./bash.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { desktopIsHome } from "./desktop-is-home.ts";
import { downloadsIsCleanedOnBoot } from "./downloads-is-cleaned-on-boot.ts";
import { gnomeDisableWayland } from "./gnome-disable-wayland.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { tmuxinatorByobuBashAliases } from "./tmuxinator_byobu_bash_aliases.ts";
import { vim } from "./vim.ts";
import { starship } from "./starship.ts";
import { UPGRADE_OS_PACKAGES } from "./refresh-os-packages.ts";
import { sudoNoPassword } from "./sudo-no-password.ts";
import { mdr } from "./mdr.ts";

export const all1MinimalSanity = Command.custom()
  .withDependencies([
    sudoNoPassword,
    UPGRADE_OS_PACKAGES,
    ...[
      "bash-completion",
      "command-not-found",
      "dos2unix",
      "jq",
      "man-db",
      "manpages",
      "ncdu",
      "network-manager-openvpn-gnome",
      "qemu-guest-agent",
      "ssh",
      "tree",
    ].map(InstallOsPackage.of),
    bash,
    vim,
    starship,
    mdr,
    saveBashHistory,
    desktopIsHome,
    downloadsIsCleanedOnBoot,
    addHomeBinToPath,
    tmuxinatorByobuBashAliases,
    gnomeDisableWayland,
  ]);
