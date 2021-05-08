import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";

export const bashGitPrompt: Command = Command.custom()
  .withDependencies([
    InstallOsPackage.of("git"),
    InstallAurPackage.of("bash-git-prompt"),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      ". /usr/lib/bash-git-prompt/gitprompt.sh",
    ),
  ]);
