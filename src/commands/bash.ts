import { Command } from "../model/command.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const bash = Command.custom()
  .withDependencies([
    InstallOsPackage.of("bash"),
    InstallOsPackage.of("bash-completion"),
    InstallOsPackage.of("util-linux"),
  ])
  .withRun(async () => {
    await ensureSuccessful(ROOT, [
      "chsh",
      "--shell",
      "/bin/bash",
      targetUser.username,
    ]);
  });
