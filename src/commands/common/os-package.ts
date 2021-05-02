import { memoize } from "../../deps.ts";
import {
  AbstractCommand,
  CommandResult,
  CommandType,
} from "../../model/command.ts";
import {
  DependencyId,
  FLATPAK,
  OS_PACKAGE_SYSTEM,
} from "../../model/dependency.ts";
import { ensureSuccessful, isSuccessful } from "../../os/exec.ts";
import { isInsideDocker } from "../../os/is-inside-docker.ts";
import { ROOT, targetUser } from "../../os/user/target-user.ts";
import { flatpak } from "../flatpak.ts";
import { REFRESH_OS_PACKAGES } from "../refresh-os-packages.ts";

export type OsPackageName = string;
export type AurPackageName = string;
export type FlatpakPackageName = string;
export type PackageName = OsPackageName | AurPackageName | FlatpakPackageName;

export abstract class AbstractPackageCommand<T extends PackageName>
  extends AbstractCommand {
  readonly packageName: T;

  protected constructor(commandType: CommandType, packageName: T) {
    super(commandType, new DependencyId(commandType, packageName));
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }
}

export class InstallOsPackage extends AbstractPackageCommand<OsPackageName> {
  private constructor(packageName: OsPackageName) {
    super("InstallOsPackage", packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (await isInstalledOsPackage(this.packageName)) {
      return this.resolve({
        stdout: `Already installed OS package ${this.packageName}.`,
        stderr: "",
        status: { success: true, code: 0 },
      });
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--needed",
      "--noconfirm",
      this.packageName,
    ]).catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Installed OS package ${this.packageName}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }

  static of: (packageName: OsPackageName) => InstallOsPackage = memoize(
    (packageName: OsPackageName): InstallOsPackage =>
      new InstallOsPackage(packageName),
  );
}

export class RemoveOsPackage extends AbstractPackageCommand<OsPackageName> {
  private constructor(packageName: OsPackageName) {
    super("RemoveOsPackage", packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (!await isInstalledOsPackage(this.packageName)) {
      return this.resolve({
        stdout: `Already removed OS package ${this.packageName}.`,
        stderr: "",
        status: { success: true, code: 0 },
      });
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--remove",
      "--noconfirm",
      this.packageName,
    ]).catch(this.doneDeferred.reject);

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
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);

    this.removePackageName = removePackageName;
    this.installPackageName = installPackageName;
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (await isInstalledOsPackage(this.removePackageName)) {
      await ensureSuccessful(ROOT, [
        "pacman",
        "--remove",
        "--noconfirm",
        "--nodeps",
        "--nodeps",
        this.removePackageName,
      ]).catch(this.doneDeferred.reject);
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--needed",
      "--noconfirm",
      this.installPackageName,
    ]).catch(this.doneDeferred.reject);

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

export class InstallAurPackage extends AbstractPackageCommand<AurPackageName> {
  private constructor(packageName: AurPackageName) {
    super("InstallAurPackage", packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
    this.dependencies.push(InstallOsPackage.of("base-devel"));
    this.dependencies.push(InstallOsPackage.of("yay"));
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (await isInstalledAurPackage(this.packageName)) {
      return this.resolve({
        stdout: `Already installed AUR package ${this.packageName}.`,
        stderr: "",
        status: { success: true, code: 0 },
      });
    }

    await ensureSuccessful(ROOT, [
      "yay",
      "--sync",
      "--refresh",
      "--needed",
      "--noconfirm",
      this.packageName,
    ]).catch(this.doneDeferred.reject);

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

export class RemoveAurPackage extends AbstractPackageCommand<AurPackageName> {
  private constructor(packageName: AurPackageName) {
    super("RemoveAurPackage", packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
    this.dependencies.push(InstallOsPackage.of("base-devel"));
    this.dependencies.push(InstallOsPackage.of("yay"));
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (!await isInstalledAurPackage(this.packageName)) {
      return this.resolve({
        stdout: `Already removed AUR package ${this.packageName}.`,
        stderr: "",
        status: { success: true, code: 0 },
      });
    }

    await ensureSuccessful(ROOT, [
      "yay",
      "--remove",
      "--nosave",
      "--noconfirm",
      this.packageName,
    ]).catch(this.doneDeferred.reject);

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

export class InstallFlatpakPackage
  extends AbstractPackageCommand<FlatpakPackageName> {
  private constructor(packageName: FlatpakPackageName) {
    super("InstallFlatpakPackage", packageName);
    this.locks.push(FLATPAK);
    this.dependencies.push(flatpak);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (await isInstalledFlatpakPackage(this.packageName)) {
      return this.resolve({
        stdout: `Already installed Flatpak package ${this.packageName}.`,
        stderr: "",
        status: { success: true, code: 0 },
      });
    }

    await ensureSuccessful(ROOT, [
      "flatpak",
      "install",
      "--or-update",
      "--noninteractive",
      ...(isInsideDocker ? ["--no-deploy"] : []),
      "flathub",
      this.packageName,
    ]).catch(this.doneDeferred.reject);

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

export class RemoveFlatpakPackage
  extends AbstractPackageCommand<FlatpakPackageName> {
  private constructor(packageName: FlatpakPackageName) {
    super("RemoveFlatpakPackage", packageName);
    this.locks.push(FLATPAK);
    this.dependencies.push(flatpak);
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    if (!await isInstalledFlatpakPackage(this.packageName)) {
      return this.resolve({
        stdout: `Already removed Flatpak package ${this.packageName}.`,
        stderr: "",
        status: { success: true, code: 0 },
      });
    }

    await ensureSuccessful(ROOT, [
      "flatpak",
      "uninstall",
      "--noninteractive",
      this.packageName,
    ]).catch(this.doneDeferred.reject);

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

function isInstalledOsPackage(
  packageName: OsPackageName,
): Promise<boolean> {
  return isSuccessful(ROOT, [
    "bash",
    "-c",
    `pacman --query --info ${packageName} | grep -E '^Name +: ${packageName}$'`,
  ], { verbose: false });
}

function isInstalledAurPackage(
  packageName: AurPackageName,
): Promise<boolean> {
  return isSuccessful(targetUser, [
    "yay",
    "--query",
    "--info",
    packageName,
  ], { verbose: false });
}

function isInstalledFlatpakPackage(
  packageName: FlatpakPackageName,
): Promise<boolean> {
  return isSuccessful(ROOT, [
    "bash",
    "-c",
    `flatpak list --columns application | grep --line-regexp '${packageName}'`,
  ], { verbose: false });
}
