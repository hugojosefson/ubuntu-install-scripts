import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ROOT } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { ReplaceOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const vim: Command = Command.custom()
  .withDependencies([
    new Exec(
      [ReplaceOsPackage.of2("vim-runtime", "neovim")],
      [FileSystemPath.of(ROOT, "/etc/alternatives")],
      ROOT,
      {},
      [
        "bash",
        "-c",
        'sudo update-alternatives --set editor "$(readlink -f "$(command -v vim)")"',
      ],
    ),
    new LineInFile(
      ROOT,
      FileSystemPath.of(ROOT, "/etc/environment"),
      "EDITOR=vim",
    ),
  ]);
