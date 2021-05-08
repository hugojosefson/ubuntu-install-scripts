import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateDir, LineInFile } from "./common/file-commands.ts";

export const addHomeBinToPath = Command.custom()
  .withDependencies([
    new CreateDir(targetUser, FileSystemPath.of(targetUser, "~/bin")),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      'export PATH="~/bin:$PATH"',
    ),
  ]);
