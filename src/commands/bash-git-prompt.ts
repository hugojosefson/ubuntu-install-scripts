import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId, FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";

export const bashGitPrompt: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("bashGitPrompt", "bashGitPrompt"));
    this.dependencies.push(
      InstallOsPackage.of("git"),
      InstallAurPackage.of("bash-git-prompt"),
      new LineInFile(
        targetUser,
        FileSystemPath.of(targetUser, "~/.bashrc"),
        ". /usr/lib/bash-git-prompt/gitprompt.sh",
      ),
    );
  }
}();
