import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { bashAliases } from "./bash-aliases.ts";
import { CreateDir, CreateFile } from "./common/file-commands.ts";
import {
  InstallAurPackage,
  InstallOsPackage,
  RemoveOsPackage,
} from "./common/os-package.ts";
import {
  tmuxinatorBaseYml,
  tmuxinatorMuxYml,
  tmuxinatorTempTemplate,
} from "./files/tmuxinator-files.ts";
import { mTemp } from "./m-temp.ts";
import { tabbed } from "./tabbed.ts";

const files: Array<[string, string]> = [
  ["base.yml", tmuxinatorBaseYml],
  ["temp.TEMPLATE", tmuxinatorTempTemplate],
  ["mux.yml", tmuxinatorMuxYml],
];

export const createTmuxinatorFiles: Array<Command> = files.map((
  [filename, contents],
) =>
  new CreateFile(
    targetUser,
    FileSystemPath.of(targetUser, `~/.tmuxinator/${filename}`),
    contents,
    true,
  )
);

const createCodeDir = new CreateDir(
  targetUser,
  FileSystemPath.of(targetUser, "~/code"),
);

const installTmuxinator = RemoveOsPackage.of("screen")
  .withDependencies([
    InstallAurPackage.of("tmuxinator"),
    ...([
      "byobu",
      "tmux",
      "alacritty",
      "xsel",
    ].map(InstallOsPackage.of)),
  ]);

export const tmuxinatorByobuBashAliases = Command.custom()
  .withDependencies([
    await tabbed(),
    installTmuxinator,
    ...createTmuxinatorFiles,
    createCodeDir,
    mTemp,
    bashAliases,
  ]);
