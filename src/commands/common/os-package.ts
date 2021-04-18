import { Command, CommandResult } from "../../model/command.ts";
import {
  AurPackageName,
  ensureInstalledAurPackage,
  ensureInstalledOsPackage,
  ensureRemovedAurPackage,
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
      status: { success: true, code: 0 },
    };
  }
}

export class InstallAurPackage implements Command {
  readonly type: "InstallAurPackage" = "InstallAurPackage";
  readonly packageName: AurPackageName;

  constructor(packageName: AurPackageName) {
    this.packageName = packageName;
  }

  static multi(packageNames: Array<AurPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new InstallAurPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    const result: void = await ensureInstalledAurPackage(
      this.packageName,
    );
    return {
      stdout: `Installed AUR package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

export class RemoveAurPackage implements Command {
  readonly type: "RemoveAurPackage" = "RemoveAurPackage";
  readonly packageName: AurPackageName;

  constructor(packageName: AurPackageName) {
    this.packageName = packageName;
  }

  static multi(packageNames: Array<AurPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new RemoveAurPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    const result: void = await ensureRemovedAurPackage(
      this.packageName,
    );
    return {
      stdout: `Removed AUR package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}
