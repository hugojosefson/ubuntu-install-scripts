import { Command, CommandResult } from "../model/command.ts";
import { upgradeOsPackages } from "../os/os-package-operations.ts";

export class UpgradeOsPackages implements Command {
  readonly type: "UpgradeOsPackages" = "UpgradeOsPackages";

  toString() {
    return JSON.stringify({ type: this.type });
  }

  async run(): Promise<CommandResult> {
    await upgradeOsPackages();
    return {
      stdout: `Upgraded OS packages.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}
