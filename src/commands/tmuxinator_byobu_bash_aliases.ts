import {
  InstallAurPackage,
  InstallOsPackage,
  RemoveOsPackage,
} from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { tabbed } from "./tabbed.ts";

export const tmuxinatorByobuBash_aliases = new ParallelCommand([
  await tabbed(),
  InstallOsPackage.multi([
    "byobu",
    "tmux",
    "alacritty",
    "xsel",
  ]),
  new SequentialCommand([
    new InstallAurPackage("tmuxinator"),
    new RemoveOsPackage("screen"),
  ]),
]);
