import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const sdkmanSourceLine = ". ~/.sdkman/bin/sdkman-init.sh";

export const sdkman = Command.custom()
  .withDependencies([
    new Exec([], [], targetUser, {}, [
      "bash",
      "-c",
      "curl -fsSL https://get.sdkman.io/ | bash",
    ])
      .withDependencies(["unzip", "zip", "curl"].map(InstallOsPackage.of)),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      sdkmanSourceLine,
    ),
  ]);
