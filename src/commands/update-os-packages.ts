import { doUpdateOsPackages } from "../os/install-os-package.ts";
import { Command, CommandResult } from "../model/command.ts";

export class UpdateOsPackages implements Command {
  readonly type: "UpdateOsPackages" = "UpdateOsPackages";

  toString() {
    return JSON.stringify({ type: this.type });
  }

  async run(): Promise<CommandResult> {
    const result: void = await doUpdateOsPackages();
    return {
      stdout: `Updated OS packages.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}
