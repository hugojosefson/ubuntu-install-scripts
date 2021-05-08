import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const mTemp = Command.custom()
  .withDependencies([
    InstallOsPackage.of("gettext"),
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/m-temp"),
      await readRelativeFile("./files/m-temp", import.meta.url),
      false,
      MODE_EXECUTABLE_775,
    ),
  ]);
