import { FileSystemPath } from "../model/dependency.ts";
import { isSuccessful } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { Command } from "../model/command.ts";

export const nvmBashRc = Command.sequential(
  `
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh"          ] && . "$NVM_DIR/nvm.sh"           # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  `
    .split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
    .map((line) =>
      new LineInFile(
        targetUser,
        FileSystemPath.of(targetUser, "~/.bashrc"),
        line,
      )
    ),
);

export const nvm = new Exec(
  [
    InstallOsPackage.of("curl"),
    InstallOsPackage.of("git"),
    nvmBashRc,
  ],
  [FileSystemPath.of(targetUser, "~/.nvm")],
  targetUser,
  {},
  [
    "sh",
    "-c",
    "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash",
  ],
)
  .withSkipIfAll([
    () =>
      isSuccessful(targetUser, [
        "bash",
        "-c",
        `. <(grep nvm "${
          FileSystemPath.of(targetUser, "~/.bashrc").path
        }") && command -v nvm`,
      ], {}),
  ]);

export const node = new Exec(
  [nvm],
  [FileSystemPath.of(targetUser, "~/.nvm")],
  targetUser,
  {},
  [
    "bash",
    "-c",
    `
set -euo pipefail
IFS=$'\n'
. <(grep nvm "${FileSystemPath.of(targetUser, "~/.bashrc").path}")

nvm install node --lts
npm install -g npm@latest
npm install -g yarn@latest

nvm install node
nvm use node
npm install -g npm@latest
npm install -g yarn@latest
nvm alias default node
  `,
  ],
)
  .withSkipIfAll([
    () =>
      isSuccessful(targetUser, [
        "bash",
        "-c",
        `. <(grep nvm "${
          FileSystemPath.of(targetUser, "~/.bashrc").path
        }") && command -v node`,
      ], {}),
  ]);
