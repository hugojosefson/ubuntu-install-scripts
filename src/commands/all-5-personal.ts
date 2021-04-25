import {
  InstallFlatpakPackage,
  InstallOsPackage,
} from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { disableSomeKeyboardShortcuts } from "./disable-some-keyboard-shortcuts.ts";
import { rust } from "./rust.ts";
import { yubikey } from "./yubikey.ts";

export const all5Personal = new ParallelCommand([
  disableSomeKeyboardShortcuts,
  InstallOsPackage.parallel([
    "jack2",
    "gnu-free-fonts",
    "noto-fonts",
    "ttf-bitstream-vera",
    "ttf-croscore",
    "ttf-dejavu",
    "ttf-droid",
    "ttf-ibm-plex",
    "ttf-liberation",
    "signal-desktop",
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
  ]),
  InstallFlatpakPackage.parallel([
    "com.spotify.Client",
    "com.slack.Slack",
    "com.microsoft.Teams",
  ]),
  rust,
  yubikey,
]);
