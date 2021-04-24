import { targetUser } from "../os/user/target-user.ts";
import { bashAliases } from "./bash-aliases.ts";
import { CreateDir, CreateFile } from "./common/file-commands.ts";
import {
  InstallAurPackage,
  InstallOsPackage,
  RemoveOsPackage,
} from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { mTemp } from "./m-temp.ts";
import { tabbed } from "./tabbed.ts";
import {
  tmuxinatorBaseYml,
  tmuxinatorMuxYml,
  tmuxinatorTempTemplate,
} from "./files/tmuxinator-files.ts";

const files: Array<[string, string]> = [
  ["base.yml", tmuxinatorBaseYml],
  ["temp.TEMPLATE", tmuxinatorTempTemplate],
  ["mux.yml", tmuxinatorMuxYml],
];

export const tmuxinatorFiles = new ParallelCommand(
  files.map(([filename, contents]) =>
    new CreateFile(targetUser, `~/.tmuxinator/${filename}`, contents, true)
  ),
);

export const tmuxinatorByobuBash_aliases = new ParallelCommand([
  await tabbed(),
  InstallOsPackage.parallel([
    "byobu",
    "tmux",
    "alacritty",
    "xsel",
  ]),
  new SequentialCommand([
    new InstallAurPackage("tmuxinator"),
    new RemoveOsPackage("screen"),
  ]),
  new CreateDir(targetUser, "~/code"),
  tmuxinatorFiles,
  mTemp,
  bashAliases,
]);
