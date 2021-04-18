import { Command } from "../model/command.ts";
import { ROOT } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const vim: Command = new ParallelCommand([
  new InstallOsPackage("vim"),
  new LineInFile(ROOT, "/etc/environment", "EDITOR=vim"),
]);
