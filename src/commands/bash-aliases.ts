import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile, LineInFile } from "./common/file-commands.ts";

export const bashAliases = Command.custom("bashAliases")
  .withDependencies([
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      ". ~/.bash_aliases",
    ),
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bash_aliases"),
      await readRelativeFile("./files/.bash_aliases", import.meta.url),
      true,
    ),
  ]);
