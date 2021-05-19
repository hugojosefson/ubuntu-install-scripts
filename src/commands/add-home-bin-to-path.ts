import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateDir, LineInFile } from "./common/file-commands.ts";

const HOME_BIN = FileSystemPath.of(targetUser, "~/bin");

export const addHomeBinToPath = Command.custom()
  .withDependencies([
    new CreateDir(targetUser, HOME_BIN),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      `export PATH="${HOME_BIN.path}:$PATH"`,
    ),
  ]);
