import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const rust = Command.custom("rust")
  .withDependencies([
    Exec.sequentialExec(targetUser, {}, [
      ["rustup", "toolchain", "install", "stable"],
      ["cargo", "install", "bat", "exa", "fd-find", "ripgrep"],
    ])
      .withDependencies(["base-devel", "rustup"].map(InstallOsPackage.of)),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      'export PATH="~/.cargo/bin:$PATH"',
    ),
  ]);
