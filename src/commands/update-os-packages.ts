import { doUpdateOsPackages } from "../os/install-os-package.ts";
import { Command, CommandResult } from "../model/command.ts";
import { notImplementedYet } from "../model/not-implemented-yet.ts";

export class UpdateOsPackages implements Command {
  readonly type: "UpdateOsPackages" = "UpdateOsPackages";
  readonly cancel = notImplementedYet(this, "cancel");

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
