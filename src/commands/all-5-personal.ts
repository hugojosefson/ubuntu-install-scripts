import { Command } from "../model/command.ts";
import { InstallOsPackage, InstallSnapPackage } from "./common/os-package.ts";
import { gsettingsAll } from "./gsettings.ts";
import { gnomeShellExtensions } from "./gnome-shell-extensions.ts";
import { keybase } from "./keybase.ts";
import { signalDesktop } from "./signal-desktop.ts";
import { yubikey } from "./yubikey.ts";
import { mullvad } from "./mullvad.ts";
import { pass } from "./pass.ts";

export const all5Personal = Command.custom()
  .withDependencies([
    ...[
      "fonts-noto",
      "ttf-bitstream-vera",
      "fonts-croscore",
      "fonts-dejavu",
      "fonts-droid-fallback",
      "fonts-ibm-plex",
      "fonts-liberation2",
      "arandr",
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
    ]
      .map(InstallOsPackage.of),
    ...[
      "spotify",
      "slack",
      "teams",
    ]
      .map(InstallSnapPackage.of),
    pass,
    yubikey,
    keybase,
    signalDesktop,
    gnomeShellExtensions,
    mullvad,
    gsettingsAll,
  ]);
