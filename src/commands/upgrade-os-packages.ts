import { Command, CommandResult } from "../model/command.ts";
import { upgradeOsPackages } from "../os/os-package-operations.ts";

export class UpgradeOsPackages implements Command {
  readonly type: "UpgradeOsPackages" = "UpgradeOsPackages";

  toString() {
    return JSON.stringify({ type: this.type });
  }

  async run(): Promise<CommandResult> {
    const result: void = await upgradeOsPackages();
    return {
      stdout: `Updated OS packages.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}
