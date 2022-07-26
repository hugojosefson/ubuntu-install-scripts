import { Command, RunResult } from "../model/command.ts";
import { OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { ROOT } from "../os/user/target-user.ts";

export const REFRESH_OS_PACKAGES = (new Command())
  .withLocks([OS_PACKAGE_SYSTEM])
  .withRun(async (): Promise<RunResult> => {
    await ensureSuccessful(ROOT, [
      "apt-get",
      "update",
    ]);
    return `Refreshed list of OS packages.`;
  });

export const UPGRADE_OS_PACKAGES = (new Command())
  .withLocks([OS_PACKAGE_SYSTEM])
  .withRun(async (): Promise<RunResult> => {
    await ensureSuccessful(ROOT, [
      "apt-get",
      "full-upgrade",
      "-y",
      "--purge",
      "--auto-remove",
    ]);
    return `Upgraded OS packages.`;
  });
