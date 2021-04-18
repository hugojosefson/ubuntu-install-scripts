import {
  InstallAurPackage,
  InstallOsPackage,
  RemoveOsPackage,
} from "./common/os-package.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
// import { tabbed } from "./tabbed.ts";

export const tmuxinatorByobuBash_aliases = new SequentialCommand([
  InstallOsPackage.multi([
    "byobu",
    "tmux",
    "alacritty",
    "xsel",
  ]),
  new InstallAurPackage("tmuxinator"),
  new RemoveOsPackage("screen"),
  // tabbed,
]);
