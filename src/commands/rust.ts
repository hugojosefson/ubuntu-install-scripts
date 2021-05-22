import { Command } from "../model/command.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const rust = Command.custom()
  .withDependencies([
    (Exec.sequentialExec(
      targetUser,
      {},
      [
        ["sh", "-c", "curl -fsSL https://sh.rustup.rs | sh -s -- -y"],
        // ["rustup", "toolchain", "install", "stable"],
        // ["rustup", "default", "stable"],
      ],
    ))
      .withDependencies(["base-devel"].map(InstallOsPackage.of)),
  ]);
