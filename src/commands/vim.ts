import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ROOT } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const vim: Command = Command.custom("vim")
  .withDependencies([
    InstallOsPackage.of("vim"),
    new LineInFile(
      ROOT,
      FileSystemPath.of(ROOT, "/etc/environment"),
      "EDITOR=vim",
    ),
  ]);
