import { Command, CommandResult } from "../../model/command.ts";
import {
  ensureInstalledOsPackage,
  ensureRemovedOsPackage,
  OsPackageName,
} from "../../os/os-package-operations.ts";
import { ParallelCommand } from "./parallel-command.ts";

export class InstallOsPackage implements Command {
  readonly type: "InstallOsPackage" = "InstallOsPackage";
  readonly packageName: OsPackageName;

  constructor(packageName: OsPackageName) {
    this.packageName = packageName;
  }

  static multi(packageNames: Array<OsPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new InstallOsPackage(packageName)),
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

export class RemoveOsPackage implements Command {
  readonly type: "RemoveOsPackage" = "RemoveOsPackage";
  readonly packageName: OsPackageName;

  constructor(packageName: OsPackageName) {
    this.packageName = packageName;
  }

  static multi(packageNames: Array<OsPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new RemoveOsPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    const result: void = await ensureRemovedOsPackage(
      this.packageName,
    );
    return {
      stdout: `Removed package ${this.packageName}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}
