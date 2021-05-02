import { memoize } from "../../deps.ts";
import {
  AbstractCommand,
  CommandResult,
  CommandType,
} from "../../model/command.ts";
import {
  Dependency,
  DependencyId,
  FLATPAK,
  Lock,
  OS_PACKAGE_SYSTEM,
} from "../../model/dependency.ts";
import {
  AurPackageName,
  ensureInstalledAurPackage,
  ensureInstalledFlatpakPackage,
  ensureInstalledOsPackage,
  ensureRemovedAurPackage,
  ensureRemovedFlatpakPackage,
  ensureRemovedOsPackage,
  ensureReplacedOsPackage,
  FlatpakPackageName,
  OsPackageName,
} from "../../os/os-package-operations.ts";
import { flatpak } from "../flatpak.ts";
import { REFRESH_OS_PACKAGES } from "../refresh-os-packages.ts";

export abstract class AbstractPackageCommand extends AbstractCommand {
  readonly packageName: OsPackageName;

  protected constructor(commandType: CommandType, packageName: OsPackageName) {
    super(commandType, new DependencyId(commandType, packageName));
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }
}

export class InstallOsPackage extends AbstractPackageCommand {
  readonly locks: Array<Lock> = [OS_PACKAGE_SYSTEM];
  readonly dependencies: Array<Dependency> = [REFRESH_OS_PACKAGES];

  private constructor(packageName: OsPackageName) {
    super("InstallOsPackage", packageName);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureInstalledOsPackage(this.packageName)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Installed package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (packageName: OsPackageName) => InstallOsPackage = memoize(
    (packageName: OsPackageName): InstallOsPackage =>
      new InstallOsPackage(packageName),
  );
}

export class RemoveOsPackage extends AbstractPackageCommand {
  readonly locks: Array<Lock> = [OS_PACKAGE_SYSTEM];
  readonly dependencies: Array<Dependency> = [REFRESH_OS_PACKAGES];

  private constructor(packageName: OsPackageName) {
    super("RemoveOsPackage", packageName);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureRemovedOsPackage(this.packageName)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Removed package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (packageName: OsPackageName) => RemoveOsPackage = (
    packageName: OsPackageName,
  ) => new RemoveOsPackage(packageName);
}

export class ReplaceOsPackage extends AbstractCommand {
  readonly locks: Array<Lock> = [OS_PACKAGE_SYSTEM];
  readonly dependencies: Array<Dependency> = [REFRESH_OS_PACKAGES];
  readonly removePackageName: OsPackageName;
  readonly installPackageName: OsPackageName;

  private constructor(
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) {
    super(
      "ReplaceOsPackage",
      new DependencyId("ReplaceOsPackage", {
        removePackageName,
        installPackageName,
      }),
    );
    this.removePackageName = removePackageName;
    this.installPackageName = installPackageName;
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureReplacedOsPackage(
      this.removePackageName,
      this.installPackageName,
    )
      .catch(this.doneDeferred.reject);

    return super.resolve({
      stdout:
        `Replaced package ${this.removePackageName} with ${this.installPackageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) => ReplaceOsPackage = (
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) => new ReplaceOsPackage(removePackageName, installPackageName);
}

export class InstallAurPackage extends AbstractPackageCommand {
  readonly locks: Array<Lock> = [OS_PACKAGE_SYSTEM];
  readonly dependencies: Array<Dependency> = [REFRESH_OS_PACKAGES];

  private constructor(packageName: AurPackageName) {
    super("InstallAurPackage", packageName);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureInstalledAurPackage(this.packageName)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Installed AUR package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (packageName: AurPackageName) => InstallAurPackage = memoize(
    (packageName: AurPackageName): InstallAurPackage =>
      new InstallAurPackage(packageName),
  );
}

export class RemoveAurPackage extends AbstractPackageCommand {
  readonly locks: Array<Lock> = [OS_PACKAGE_SYSTEM];
  readonly dependencies: Array<Dependency> = [REFRESH_OS_PACKAGES];

  private constructor(packageName: AurPackageName) {
    super("RemoveAurPackage", packageName);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureRemovedAurPackage(this.packageName)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Removed AUR package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (packageName: AurPackageName) => RemoveAurPackage = (
    packageName: AurPackageName,
  ) => new RemoveAurPackage(packageName);
}

export class InstallFlatpakPackage extends AbstractPackageCommand {
  readonly locks: Array<Lock> = [FLATPAK];
  readonly dependencies: Array<Dependency> = [flatpak];

  private constructor(packageName: FlatpakPackageName) {
    super("InstallFlatpakPackage", packageName);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureInstalledFlatpakPackage(this.packageName)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Installed Flatpak package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (
    packageName: FlatpakPackageName,
  ) => InstallFlatpakPackage = memoize(
    (packageName: FlatpakPackageName): InstallFlatpakPackage =>
      new InstallFlatpakPackage(packageName),
  );
}

export class RemoveFlatpakPackage extends AbstractPackageCommand {
  readonly locks: Array<Lock> = [FLATPAK];
  readonly dependencies: Array<Dependency> = [flatpak];

  private constructor(packageName: FlatpakPackageName) {
    super("RemoveFlatpakPackage", packageName);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await ensureRemovedFlatpakPackage(this.packageName)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Removed Flatpak package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (packageName: FlatpakPackageName) => RemoveFlatpakPackage = (
    packageName: FlatpakPackageName,
  ) => new RemoveFlatpakPackage(packageName);
}
