import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { all3DeveloperWeb } from "./all-3-developer-web.ts";
import { all4DeveloperJava } from "./all-4-developer-java.ts";
import { bashAliases } from "./bash-aliases.ts";
import { bashGitPrompt } from "./bash-git-prompt.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { desktopIsHome } from "./desktop-is-home.ts";
import { docker } from "./docker.ts";
import { downloadsIsTmp } from "./downloads-is-tmp.ts";
import { gitk } from "./gitk.ts";
import { idea } from "./idea.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { java } from "./java.ts";
import { mTemp } from "./m-temp.ts";
import { networkUtils } from "./network-utils.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { tabbed } from "./tabbed.ts";
import {
  tmuxinatorByobuBash_aliases,
  tmuxinatorFiles,
} from "./tmuxinator_byobu_bash_aliases.ts";
import { UpgradeOsPackages } from "./upgrade-os-packages.ts";
import { vim } from "./vim.ts";
import { virtManager } from "./virt-manager.ts";

const commands: Record<string, Command> = {
  ["all-1-minimal-sanity"]: all1MinimalSanity,
  ["all-2-developer-base"]: all2DeveloperBase,
  ["all-3-developer-web"]: all3DeveloperWeb,
  ["all-4-developer-java"]: all4DeveloperJava,
  upgradeOsPackages: new UpgradeOsPackages(),
  gitk,
  vim,
  saveBashHistory,
  bashGitPrompt,
  isolateInDocker,
  desktopIsHome,
  docker,
  virtManager,
  downloadsIsTmp,
  addHomeBinToPath,
  addNodeModulesBinToPath,
  java,
  idea,
  tmuxinatorByobuBash_aliases,
  tmuxinatorFiles,
  mTemp,
  networkUtils,
  bashAliases,
  tabbed: await tabbed(),
  awscli: new InstallOsPackage("aws-cli"),
  libreoffice: InstallOsPackage.parallel([
    "libreoffice-fresh",
    "libreoffice-fresh-en-gb",
    "libreoffice-fresh-sv",
  ]),
};

export const getCommand = (name: string): Command =>
  commands[name] || new InstallOsPackage(name);

export const availableCommands: Array<string> = Object.keys(commands).sort();
