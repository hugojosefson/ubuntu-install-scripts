import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { bash } from "./bash.ts";
import { CreateFile, LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { gitCompletion } from "./git-completion.ts";
import { vim } from "./vim.ts";

export const bashAliases = Command.custom()
  .withDependencies([
    bash,
    gitCompletion,
    vim,
    InstallOsPackage.of("exa"),
    InstallOsPackage.of("jq"),
    InstallOsPackage.of("xsel"),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      ". ~/.bash_aliases",
    ),
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bash_aliases"),
      await readRelativeFile("./files/.bash_aliases", import.meta.url),
      true,
    ),
  ]);
