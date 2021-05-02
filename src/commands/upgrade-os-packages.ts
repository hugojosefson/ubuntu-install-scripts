import { AbstractCommand, CommandResult } from "../model/command.ts";
import { DependencyId, OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { upgradeOsPackages } from "../os/os-package-operations.ts";

class UpgradeOsPackages extends AbstractCommand {
  private constructor() {
    super(
      "UpgradeOsPackages",
      new DependencyId(
        "UpgradeOsPackages",
        "UPGRADE_OS_PACKAGES",
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

    await upgradeOsPackages()
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Upgraded OS packages.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static UPGRADE_OS_PACKAGES = new UpgradeOsPackages();
}
export const UPGRADE_OS_PACKAGES = UpgradeOsPackages.UPGRADE_OS_PACKAGES;
