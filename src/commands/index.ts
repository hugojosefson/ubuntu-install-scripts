import { isDocker, kebabCase } from "../deps.ts";
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
import { brew, flatpak, InstallOsPackage, snap } from "./common/os-package.ts";
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
  gsettingsLocalisation,
  gsettingsLookAndFeel,
  gsettingsPrivacy,
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
import { isolateInDocker, isolateInDockerAll } from "./isolate-in-docker.ts";
import { java, sdkmanJava } from "./java.ts";
import { keybase } from "./keybase.ts";
import { mTemp } from "./m-temp.ts";
import { meld } from "./meld.ts";
import { minecraft } from "./minecraft.ts";
import { networkUtils } from "./network-utils.ts";
import { rust } from "./rust.ts";
import { saveBashHistory } from "./save-bash-history.ts";
import { signalDesktopViaDocker } from "./signal-desktop-via-docker.ts";
import { starship } from "./starship.ts";
import { toggleTerminal } from "./toggle-terminal.ts";
import {
  createTmuxinatorFiles,
  tmuxinatorByobuBashAliases,
} from "./tmuxinator_byobu_bash_aliases.ts";
import { vim } from "./vim.ts";
import { virtualbox } from "./virtualbox.ts";
import { yubikey } from "./yubikey.ts";
import { UPGRADE_OS_PACKAGES } from "./refresh-os-packages.ts";
import { alacritty } from "./alacritty.ts";
import { node, nvm } from "./node.ts";
import { openMux } from "./open-mux.ts";
import { gnomeDisableWayland } from "./gnome-disable-wayland.ts";
import { downloadsIsCleanedOnBoot } from "./downloads-is-cleaned-on-boot.ts";
import { sudoNoPassword } from "./sudo-no-password.ts";
import { chrome } from "./chrome.ts";
import { brave } from "./brave.ts";
import { webstorm } from "./webstorm.ts";
import { signalDesktop } from "./signal-desktop.ts";
import { pass } from "./pass.ts";
import { mdr } from "./mdr.ts";

const commands: Record<string, Command> = {
  alacritty,
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
  bash,
  bashAliases,
  bashGitPrompt,
  brave,
  brew,
  chrome,
  deno,
  desktopIsHome,
  docker,
  downloadsIsCleanedOnBoot,
  downloadsIsTmp,
  eog,
  flatpak,
  fzf: await fzf(),
  gedit,
  git,
  gitk,
  gnomeCustomKeybindingsBackup,
  gnomeDisableWayland,
  gnomeShellExtensions,
  gnomeShellExtensionInstaller,
  gsettingsAll,
  gsettingsDisableSomeKeyboardShortcuts,
  gsettingsEnableSomeKeyboardShortcuts,
  gsettingsLocalisation,
  gsettingsLocalization: gsettingsLocalisation,
  gsettingsLookAndFeel,
  gsettingsPrivacy,
  gsettingsUsefulDefaults,
  gsettingsWindows,
  idea,
  insync,
  isInsideDocker: Command.custom().withRun(async () =>
    await isDocker()
      ? "✓ You are in a docker container."
      : "✗ You are NOT in a docker container."
  ),
  isolateInDocker,
  isolateInDockerAll,
  java,
  keybase,
  libreoffice: Command.custom().withDependencies(
    [
      "hunspell-en-gb",
      "hunspell-sv",
      "hyphen-en-gb",
      "hyphen-sv",
      "libreoffice",
      "libreoffice-help-en-gb",
      "libreoffice-l10n-en-gb",
      "libreoffice-l10n-sv",
      "libreoffice-lightproof-en",
      "mythes-en-us",
      "mythes-sv",
    ].map(InstallOsPackage.of),
  ),
  mTemp,
  mdr,
  meld,
  minecraft,
  networkUtils,
  nullCommand: Command.custom(),
  nvm,
  node,
  openMux,
  pass,
  rust,
  saveBashHistory,
  sdkmanJava,
  signalDesktop,
  signalDesktopViaDocker,
  snap,
  starship,
  sudoNoPassword,
  toggleTerminal,
  tmuxinatorByobuBashAliases,
  tmuxinatorFiles: Command.custom().withDependencies(createTmuxinatorFiles),
  upgradeOsPackages: UPGRADE_OS_PACKAGES,
  vim,
  virtualbox,
  webstorm,
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
