import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ROOT } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { ReplaceOsPackage } from "./common/os-package.ts";

export const vim: Command = Command.custom()
  .withDependencies([
    ReplaceOsPackage.of2("vim-runtime", "neovim"),
    new LineInFile(
      ROOT,
      FileSystemPath.of(ROOT, "/etc/environment"),
      "EDITOR=vim",
    ),
  ]);
