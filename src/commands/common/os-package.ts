import { Command, CommandResult } from "../../model/command.ts";
import {
  AurPackageName,
  ensureInstalledAurPackage,
  ensureInstalledFlatpakPackage,
  ensureInstalledOsPackage,
  ensureRemovedAurPackage,
  ensureRemovedFlatpakPackage,
  ensureRemovedOsPackage,
  FlatpakPackageName,
  OsPackageName,
} from "../../os/os-package-operations.ts";
import { ParallelCommand } from "./parallel-command.ts";

export class InstallOsPackage implements Command {
  readonly type: "InstallOsPackage" = "InstallOsPackage";
  readonly packageName: OsPackageName;

  constructor(packageName: OsPackageName) {
    this.packageName = packageName;
  }

  static parallel(packageNames: Array<OsPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new InstallOsPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    await ensureInstalledOsPackage(
      this.packageName,
    );
    return {
      stdout: `Installed package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

export const IGNORE_DEPENDENTS: Array<string> = ["--nodeps", "--nodeps"];

export class RemoveOsPackage implements Command {
  readonly type: "RemoveOsPackage" = "RemoveOsPackage";
  readonly packageName: OsPackageName;
  readonly extraArgs: Array<string>;

  constructor(packageName: OsPackageName, extraArgs: Array<string> = []) {
    this.packageName = packageName;
    this.extraArgs = extraArgs;
  }

  static parallel(
    packageNames: Array<OsPackageName>,
    extraArgs: Array<string> = [],
  ): Command {
    return new ParallelCommand(
      packageNames.map((packageName) =>
        new RemoveOsPackage(packageName, extraArgs)
      ),
    );
  }

  toString() {
    return JSON.stringify({
      type: this.type,
      packageName: this.packageName,
      extraArgs: this.extraArgs,
    });
  }

  async run(): Promise<CommandResult> {
    await ensureRemovedOsPackage(
      this.packageName,
      this.extraArgs,
    );
    return {
      stdout: `Removed package ${
        this.extraArgs.length ? `with ${this.extraArgs.join(" ")}, ` : ""
      }${this.packageName}.`,
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

  static parallel(packageNames: Array<AurPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new InstallAurPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    await ensureInstalledAurPackage(
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

  static parallel(packageNames: Array<AurPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new RemoveAurPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    await ensureRemovedAurPackage(
      this.packageName,
    );
    return {
      stdout: `Removed AUR package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

export class InstallFlatpakPackage implements Command {
  readonly type: "InstallFlatpakPackage" = "InstallFlatpakPackage";
  readonly packageName: FlatpakPackageName;

  constructor(packageName: FlatpakPackageName) {
    this.packageName = packageName;
  }

  static parallel(packageNames: Array<FlatpakPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new InstallFlatpakPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    await ensureInstalledFlatpakPackage(
      this.packageName,
    );
    return {
      stdout: `Installed Flatpak package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

export class RemoveFlatpakPackage implements Command {
  readonly type: "RemoveFlatpakPackage" = "RemoveFlatpakPackage";
  readonly packageName: FlatpakPackageName;

  constructor(packageName: FlatpakPackageName) {
    this.packageName = packageName;
  }

  static parallel(packageNames: Array<FlatpakPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new RemoveFlatpakPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(): Promise<CommandResult> {
    await ensureRemovedFlatpakPackage(
      this.packageName,
    );
    return {
      stdout: `Removed Flatpak package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}
