import { Command } from "../model/command.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const vim: Command = new ParallelCommand([
  new InstallOsPackage("vim"),
  new LineInFile("/etc/environment", "EDITOR=vim"),
]);
