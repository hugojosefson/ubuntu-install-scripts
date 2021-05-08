import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { all3DeveloperWeb } from "./all-3-developer-web.ts";
import { all4DeveloperJava } from "./all-4-developer-java.ts";
import { all5Personal } from "./all-5-personal.ts";
import { all6Gaming } from "./all-6-gaming.ts";
import { bashAliases } from "./bash-aliases.ts";
import { bashGitPrompt } from "./bash-git-prompt.ts";
import { flatpak, InstallOsPackage } from "./common/os-package.ts";
import { desktopIsHome } from "./desktop-is-home.ts";
import { disableSomeKeyboardShortcuts } from "./disable-some-keyboard-shortcuts.ts";
import { docker } from "./docker.ts";
import { downloadsIsTmp } from "./downloads-is-tmp.ts";
import { gitk } from "./gitk.ts";
import { idea } from "./idea.ts";
import { insync } from "./insync.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { java, sdkmanJava } from "./java.ts";
import { keybase } from "./keybase.ts";
import { mTemp } from "./m-temp.ts";
import { minecraft } from "./minecraft.ts";
import { networkUtils } from "./network-utils.ts";
import { nordvpn } from "./nordvpn.ts";
import { rust } from "./rust.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { tabbed } from "./tabbed.ts";
import {
  createTmuxinatorFiles,
  tmuxinatorByobuBashAliases,
} from "./tmuxinator_byobu_bash_aliases.ts";
import { UPGRADE_OS_PACKAGES } from "./upgrade-os-packages.ts";
import { vim } from "./vim.ts";
import { virtManager } from "./virt-manager.ts";
import { virtualbox } from "./virtualbox.ts";
import { yubikey } from "./yubikey.ts";

const commands: Record<string, Command> = {
  ["all"]: Command.custom().withDependencies([
    all3DeveloperWeb,
    all4DeveloperJava,
    all5Personal,
    all6Gaming,
  ]),
  ["all-1-minimal-sanity"]: all1MinimalSanity,
  ["all-2-developer-base"]: all2DeveloperBase,
  ["all-3-developer-web"]: all3DeveloperWeb,
  ["all-4-developer-java"]: all4DeveloperJava,
  ["all-5-personal"]: all5Personal,
  ["all-6-gaming"]: all6Gaming,
  UPGRADE_OS_PACKAGES,
  gitk,
  vim,
  nullCommand: Command.custom(),
  disableSomeKeyboardShortcuts,
  saveBashHistory,
  bashGitPrompt,
  isolateInDocker,
  desktopIsHome,
  docker,
  virtManager,
  virtualbox,
  insync,
  minecraft,
  downloadsIsTmp,
  addHomeBinToPath,
  addNodeModulesBinToPath,
  flatpak,
  java,
  sdkmanJava,
  idea,
  rust,
  yubikey,
  keybase,
  nordvpn,
  tmuxinatorByobuBashAliases,
  tmuxinatorFiles: Command.custom().withDependencies(createTmuxinatorFiles),
  mTemp,
  networkUtils,
  bashAliases,
  tabbed: await tabbed(),
  awscli: InstallOsPackage.of("aws-cli"),
  libreoffice: Command.custom().withDependencies(
    [
      "libreoffice-fresh",
      "libreoffice-fresh-en-gb",
      "libreoffice-fresh-sv",
    ].map(InstallOsPackage.of),
  ),
};

export const getCommand = (name: string): Command =>
  commands[name] || InstallOsPackage.of(name);

export const availableCommands: Array<string> = Object.keys(commands).sort();
