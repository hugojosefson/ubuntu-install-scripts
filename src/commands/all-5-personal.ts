import { Command } from "../model/command.ts";
import { android } from "./android.ts";
import {
  InstallFlatpakPackage,
  InstallOsPackage,
} from "./common/os-package.ts";
import { gsettingsAll } from "./gsettings.ts";
import { gnomeShellExtensions } from "./gnome-shell-extensions.ts";
import { insync } from "./insync.ts";
import { keybase } from "./keybase.ts";
import { signalDesktopViaDocker } from "./signal-desktop-via-docker.ts";
import { yubikey } from "./yubikey.ts";
import { mullvad } from "./mullvad.ts";

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
      "pass",
      "xpra",
    ]
      .map(InstallOsPackage.of),
    ...[
      "com.spotify.Client",
      "com.slack.Slack",
      "com.microsoft.Teams",
    ]
      .map(InstallFlatpakPackage.of),
    yubikey,
    keybase,
    signalDesktopViaDocker,
    gnomeShellExtensions,
    mullvad,
    insync,
    android,
    gsettingsAll,
  ]);
