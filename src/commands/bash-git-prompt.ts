import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const bashGitPrompt = new ParallelCommand([
  new InstallOsPackage("git"),
  new LineInFile(
    targetUser,
    "~/.bashrc",
    ". /usr/lib/bash-git-prompt/gitprompt.sh",
  ),
  InstallAurPackage.parallel([
    "bash-git-prompt",
  ]),
]);
