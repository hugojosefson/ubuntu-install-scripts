import { Command } from "../model/command.ts";
import { ensureSuccessful, ensureSuccessfulStdOut } from "../os/exec.ts";
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
      await ensureSuccessfulStdOut(ROOT, ["sh", "-c", "command -v bash"]),
      targetUser.username,
    ]);
  });
