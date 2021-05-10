import { Command } from "../model/command.ts";
import {
  InstallFlatpakPackage,
  InstallOsPackage,
  ReplaceOsPackage,
} from "./common/os-package.ts";
import { disableSomeKeyboardShortcuts } from "./disable-some-keyboard-shortcuts.ts";
import { gnomeExtensions } from "./gnome-extensions.ts";
import { insync } from "./insync.ts";
import { keybase } from "./keybase.ts";
import { nordvpn } from "./nordvpn.ts";
import { rust } from "./rust.ts";
import { yubikey } from "./yubikey.ts";

const withDependencies = (dependencies: Array<Command>) =>
  (command: Command) => command.withDependencies(dependencies);

const replaceJack = ReplaceOsPackage.of2("jack", "jack2");

export const all5Personal = Command.custom()
  .withDependencies([
    disableSomeKeyboardShortcuts,
    ...[
      "gnu-free-fonts",
      "noto-fonts",
      "ttf-bitstream-vera",
      "ttf-croscore",
      "ttf-dejavu",
      "ttf-droid",
      "ttf-ibm-plex",
      "ttf-liberation",
      "signal-desktop",
      "android-tools",
      "arandr",
      "audacity",
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
    rust,
    yubikey,
    keybase,
    gnomeExtensions,
    nordvpn,
    insync,
  ]);
