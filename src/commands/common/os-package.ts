import { Command, CommandResult } from "../../model/command.ts";
import {
  AurPackageName,
  ensureInstalledAurPackage,
  ensureInstalledFlatpakPackage,
  ensureInstalledOsPackage,
  ensureRemovedAurPackage,
  ensureRemovedFlatpakPackage,
  ensureRemovedOsPackage,
  ensureSwitchedOsPackage,
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

export class RemoveOsPackage implements Command {
  readonly type: "RemoveOsPackage" = "RemoveOsPackage";
  readonly packageName: OsPackageName;

  constructor(packageName: OsPackageName) {
    this.packageName = packageName;
  }

  static parallel(packageNames: Array<OsPackageName>): Command {
    return new ParallelCommand(
      packageNames.map((packageName) => new RemoveOsPackage(packageName)),
    );
  }

  toString() {
    return JSON.stringify({
      type: this.type,
      packageName: this.packageName,
    });
  }

  async run(): Promise<CommandResult> {
    await ensureRemovedOsPackage(this.packageName);
    return {
      stdout: `Removed package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

export class SwitchOsPackage implements Command {
  readonly type: "SwitchOsPackage" = "SwitchOsPackage";
  readonly removePackageName: OsPackageName;
  readonly installPackageName: OsPackageName;

  constructor(
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) {
    this.removePackageName = removePackageName;
    this.installPackageName = installPackageName;
  }

  toString() {
    return JSON.stringify({
      type: this.type,
      removePackageName: this.removePackageName,
      installPackageName: this.installPackageName,
    });
  }

  async run(): Promise<CommandResult> {
    await ensureSwitchedOsPackage(
      this.removePackageName,
      this.installPackageName,
    );
    return {
      stdout:
        `Switched package ${this.removePackageName} to ${this.installPackageName}.`,
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
