import { kebabCase } from "../deps.ts";
import { toObject } from "../fn.ts";
import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all1MinimalSanity } from "./all-1-minimal-sanity.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { all3DeveloperWeb } from "./all-3-developer-web.ts";
import { all4DeveloperJava } from "./all-4-developer-java.ts";
import { all5Personal } from "./all-5-personal.ts";
import { all6Gaming } from "./all-6-gaming.ts";
import { android } from "./android.ts";
import { bashAliases } from "./bash-aliases.ts";
import { bashGitPrompt } from "./bash-git-prompt.ts";
import { bash } from "./bash.ts";
import { flatpak, InstallOsPackage } from "./common/os-package.ts";
import { deno } from "./deno.ts";
import { desktopIsHome } from "./desktop-is-home.ts";
import { eog } from "./eog.ts";
import { git } from "./git.ts";
import { gnomeCustomKeybindingsBackup } from "./gnome-custom-keybindings-backup.ts";
import { gnomeShellExtensionInstaller } from "./gnome-shell-extension-installer.ts";
import {
  gsettingsAll,
  gsettingsDisableSomeKeyboardShortcuts,
  gsettingsEnableSomeKeyboardShortcuts,
  gsettingsInput,
  gsettingsLocalisation,
  gsettingsLookAndFeel,
  gsettingsPrivacy,
  gsettingsScreenshot,
  gsettingsUsefulDefaults,
  gsettingsWindows,
} from "./gsettings.ts";
import { docker } from "./docker.ts";
import { downloadsIsTmp } from "./downloads-is-tmp.ts";
import { fzf } from "./fzf.ts";
import { gedit } from "./gedit.ts";
import { gitk } from "./gitk.ts";
import { gnomeShellExtensions } from "./gnome-shell-extensions.ts";
import { idea } from "./idea.ts";
import { insync } from "./insync.ts";
import { isolateInDocker } from "./isolate-in-docker.ts";
import { java, sdkmanJava } from "./java.ts";
import { keybase } from "./keybase.ts";
import { mTemp } from "./m-temp.ts";
import { meld } from "./meld.ts";
import { minecraft } from "./minecraft.ts";
import { networkUtils } from "./network-utils.ts";
import { nordvpn } from "./nordvpn.ts";
import { rust } from "./rust.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { starship } from "./starship.ts";
import { tabbed } from "./tabbed.ts";
import {
  createTmuxinatorFiles,
  tmuxinatorByobuBashAliases,
} from "./tmuxinator_byobu_bash_aliases.ts";
import { vim } from "./vim.ts";
import { virtManager } from "./virt-manager.ts";
import { virtualbox } from "./virtualbox.ts";
import { xorg } from "./xorg.ts";
import { yubikey } from "./yubikey.ts";

const commands: Record<string, Command> = {
  all: Command.custom().withDependencies([
    all3DeveloperWeb,
    all4DeveloperJava,
    all5Personal,
    all6Gaming,
  ]),
  all1MinimalSanity,
  all2DeveloperBase,
  all3DeveloperWeb,
  all4DeveloperJava,
  all5Personal,
  all6Gaming,
  addHomeBinToPath,
  addNodeModulesBinToPath,
  android,
  awscli: InstallOsPackage.of("aws-cli"),
  bash,
  bashAliases,
  bashGitPrompt,
  deno,
  desktopIsHome,
  docker,
  downloadsIsTmp,
  eog,
  flatpak,
  fzf: await fzf(),
  gedit,
  git,
  gitk,
  gnomeCustomKeybindingsBackup,
  gnomeShellExtensions,
  gnomeShellExtensionInstaller,
  gsettingsAll,
  gsettingsDisableSomeKeyboardShortcuts,
  gsettingsEnableSomeKeyboardShortcuts,
  gsettingsInput,
  gsettingsLocalisation,
  gsettingsLocalization: gsettingsLocalisation,
  gsettingsLookAndFeel,
  gsettingsPrivacy,
  gsettingsScreenshot,
  gsettingsUsefulDefaults,
  gsettingsWindows,
  idea,
  insync,
  isolateInDocker,
  java,
  keybase,
  libreoffice: Command.custom().withDependencies(
    [
      "libreoffice-fresh",
      "libreoffice-fresh-en-gb",
      "libreoffice-fresh-sv",
    ].map(InstallOsPackage.of),
  ),
  mTemp,
  meld,
  minecraft,
  networkUtils,
  nordvpn,
  nullCommand: Command.custom(),
  rust,
  saveBashHistory,
  sdkmanJava,
  starship,
  tabbed: await tabbed(),
  tmuxinatorByobuBashAliases,
  tmuxinatorFiles: Command.custom().withDependencies(createTmuxinatorFiles),
  upgradeOsPackages: InstallOsPackage.upgradePackages(),
  vim,
  virtManager,
  virtualbox,
  xorg,
  yubikey,
};

const kebabCommands: Record<string, Command> = Object.entries(commands)
  .map(([key, value]) => [kebabCase(key), value] as [string, Command])
  .reduce(
    toObject<string, Command>(),
    {},
  );

export const getCommand = (name: string): Command =>
  kebabCommands[name] || InstallOsPackage.of(name);

export const availableCommands: Array<string> = Object.keys(kebabCommands)
  .sort();
