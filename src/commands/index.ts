import { Command } from "../model/command.ts";
import { requireEnv } from "../os/require-env.ts";
import { getTargetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { SymlinkElsewhere } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { tmuxinatorByobuBash_aliases } from "./tmuxinator_byobu_bash_aliases.ts";
import { UpgradeOsPackages } from "./upgrade-os-packages.ts";
import { vim } from "./vim.ts";
import { gitk } from "./gitk.ts";

const HOME: string = requireEnv("HOME");

const desktopIsHome = new SymlinkElsewhere(
  await getTargetUser(),
  `~/Desktop`,
  ".",
);
const downloadsIsTmp = new SymlinkElsewhere(
  await getTargetUser(),
  `~/Downloads`,
  "/tmp",
);
const commands: Record<string, Command> = {
  ["all-1-minimal-sanity"]: new ParallelCommand([
    new UpgradeOsPackages(),
    InstallOsPackage.multi([
      "dos2unix",
      "jq",
      "ncdu",
      "networkmanager-openvpn",
      "solaar",
      "openssh",
      "tree",
    ]),
    vim,
    saveBashHistory,
    desktopIsHome,
    downloadsIsTmp,
    addHomeBinToPath,
    tmuxinatorByobuBash_aliases,
  ]),
  upgradeOsPackages: new UpgradeOsPackages(),
  gitk,
  vim,
  saveBashHistory,
  desktopIsHome,
  downloadsIsTmp,
  addHomeBinToPath,
  tmuxinatorByobuBash_aliases,
  awscli: new InstallOsPackage("aws-cli"),
  libreoffice: InstallOsPackage.multi([
    "libreoffice-fresh",
    "libreoffice-fresh-en-gb",
    "libreoffice-fresh-sv",
  ]),
};

export const getCommand = (name: string): Command =>
  commands[name] || new InstallOsPackage(name);

export const availableCommands: Array<string> = Object.keys(commands);
