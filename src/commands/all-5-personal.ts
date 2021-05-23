import { Command } from "../model/command.ts";
import { android } from "./android.ts";
import {
  InstallFlatpakPackage,
  InstallOsPackage,
  ReplaceOsPackage,
} from "./common/os-package.ts";
import { gsettingsAll } from "./gsettings.ts";
import { gnomeShellExtensions } from "./gnome-shell-extensions.ts";
import { insync } from "./insync.ts";
import { keybase } from "./keybase.ts";
import { nordvpn } from "./nordvpn.ts";
import { signalDesktopViaDocker } from "./signal-desktop-via-docker.ts";
import { yubikey } from "./yubikey.ts";

const withDependencies = (dependencies: Array<Command>) =>
  (command: Command) => command.withDependencies(dependencies);

const replaceJack = ReplaceOsPackage.of2("jack", "jack2");

export const all5Personal = Command.custom()
  .withDependencies([
    ...[
      "gnu-free-fonts",
      "noto-fonts",
      "ttf-bitstream-vera",
      "ttf-croscore",
      "ttf-dejavu",
      "ttf-droid",
      "ttf-ibm-plex",
      "ttf-liberation",
      "arandr",
      "audacity",
      "baobab",
      "cheese",
      "docx2txt",
      "dosbox",
      "efibootmgr",
      "ffmpeg",
      "gimp",
      "gnome-tweaks",
      "gpick",
      "imagemagick",
      "inkscape",
      "neofetch",
      "pass",
      "xpra",
    ]
      .map(InstallOsPackage.of)
      .map(withDependencies([replaceJack])),
    ...[
      "com.spotify.Client",
      "com.slack.Slack",
      "com.microsoft.Teams",
    ]
      .map(InstallFlatpakPackage.of)
      .map(withDependencies([replaceJack])),
    yubikey,
    keybase,
    signalDesktopViaDocker,
    gnomeShellExtensions,
    nordvpn,
    insync,
    android,
    gsettingsAll,
  ]);
