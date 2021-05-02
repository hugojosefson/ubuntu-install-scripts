import { AbstractCommand, CommandResult } from "../model/command.ts";
import { DependencyId, OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { ROOT } from "../os/user/target-user.ts";

class RefreshOsPackages extends AbstractCommand {
  private constructor() {
    super(
      "RefreshOsPackages",
      new DependencyId(
        "RefreshOsPackages",
        "REFRESH_OS_PACKAGES",
      ),
    );
    this.locks.push(OS_PACKAGE_SYSTEM);
  }

  toString() {
    return JSON.stringify({ type: this.type });
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--refresh",
    ]).catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Refreshed list of OS packages.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static REFRESH_OS_PACKAGES = new RefreshOsPackages();
}
export const REFRESH_OS_PACKAGES = RefreshOsPackages.REFRESH_OS_PACKAGES;
