import { Command, RunResult } from "../model/command.ts";
import { OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { ROOT } from "../os/user/target-user.ts";

export const REFRESH_OS_PACKAGES = Command.of("RefreshOsPackages")
  .withLocks([OS_PACKAGE_SYSTEM])
  .withRun(async (): Promise<RunResult> => {
    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--refresh",
    ]);
    return `Refreshed list of OS packages.`;
  });
