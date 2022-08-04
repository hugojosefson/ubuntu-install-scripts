import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import {
  CreateFile,
  LineInFile,
  MODE_EXECUTABLE_775,
} from "./common/file-commands.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";

export const openMux = Command.custom()
  .withDependencies([
    addHomeBinToPath,
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/open-mux"),
      await readRelativeFile("./files/open-mux", import.meta.url),
      false,
      MODE_EXECUTABLE_775,
    ),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bash_history"),
      "open-mux",
    ),
  ]);
