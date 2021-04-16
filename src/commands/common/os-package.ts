import { ensureInstalledOsPackage } from "../../os/install-os-package.ts";
import { Command, CommandResult } from "../../model/command.ts";
import { notImplementedYet } from "../../model/not-implemented-yet.ts";
import { ParallelCommand } from "./parallel-command.ts";

export class OsPackage implements Command {
  readonly type: "OsPackage" = "OsPackage";
  readonly packageName: string;
  readonly cancel = notImplementedYet(this, "cancel");

  constructor(packageName: string) {
    this.packageName = packageName;
  }

  static multi(packageNames: Array<string>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new OsPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    const result: void = await ensureInstalledOsPackage(
      this.packageName,
    );
    return {
      stdout: `Installed package ${this.packageName}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}
