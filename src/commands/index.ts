import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { bashAliases } from "./bash-aliases.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { desktopIsHome } from "./desktop-is-home.ts";
import { downloadsIsTmp } from "./downloads-is-tmp.ts";
import { gitk } from "./gitk.ts";
import { mTemp } from "./m-temp.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { tabbed } from "./tabbed.ts";
import {
  tmuxinatorByobuBash_aliases,
  tmuxinatorFiles,
} from "./tmuxinator_byobu_bash_aliases.ts";
import { UpgradeOsPackages } from "./upgrade-os-packages.ts";
import { vim } from "./vim.ts";

const commands: Record<string, Command> = {
  ["all-1-minimal-sanity"]: all1MinimalSanity,
  upgradeOsPackages: new UpgradeOsPackages(),
  gitk,
  vim,
  saveBashHistory,
  desktopIsHome,
  downloadsIsTmp,
  addHomeBinToPath,
  addNodeModulesBinToPath,
  tmuxinatorByobuBash_aliases,
  tmuxinatorFiles,
  mTemp,
  bashAliases,
  tabbed: await tabbed(),
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
