import {
  ensureInstalledOsPackage,
  OsPackageName,
} from "../../os/install-os-package.ts";
import { Command, CommandResult } from "../../model/command.ts";
import { ParallelCommand } from "./parallel-command.ts";

export class OsPackage implements Command {
  readonly type: "OsPackage" = "OsPackage";
  readonly packageName: OsPackageName;

  constructor(packageName: OsPackageName) {
    this.packageName = packageName;
  }

  static multi(packageNames: Array<OsPackageName>): Command {
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
