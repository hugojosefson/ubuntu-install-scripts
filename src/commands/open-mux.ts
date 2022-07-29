import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";

export const openMux = Command.custom()
  .withDependencies([
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/open-mux"),
      await readRelativeFile("./files/open-mux", import.meta.url),
      false,
      MODE_EXECUTABLE_775,
    ),
  ]);
