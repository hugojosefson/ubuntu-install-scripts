import { memoize } from "../../deps.ts";
import { Command, RunResult } from "../../model/command.ts";
import { FLATPAK, OS_PACKAGE_SYSTEM } from "../../model/dependency.ts";
import { ensureSuccessful, isSuccessful } from "../../os/exec.ts";
import { isInsideDocker } from "../../os/is-inside-docker.ts";
import { ROOT, targetUser } from "../../os/user/target-user.ts";
import { REFRESH_OS_PACKAGES } from "../refresh-os-packages.ts";

export type OsPackageName = string;
export type AurPackageName = string;
export type FlatpakPackageName = string;
export type PackageName = OsPackageName | AurPackageName | FlatpakPackageName;

export abstract class AbstractPackageCommand<T extends PackageName>
  extends Command {
  readonly packageName: T;

  protected constructor(packageName: T) {
    super();
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ packageName: this.packageName });
  }
}

export class InstallOsPackage extends AbstractPackageCommand<OsPackageName> {
  private constructor(packageName: OsPackageName) {
    super(packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
  }

  async run(): Promise<RunResult> {
    if (await isInstalledOsPackage(this.packageName)) {
      return `Already installed OS package ${this.packageName}.`;
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--needed",
      "--noconfirm",
      this.packageName,
    ]);

    return `Installed OS package ${this.packageName}.`;
  }

  static of: (packageName: OsPackageName) => InstallOsPackage = memoize(
    (packageName: OsPackageName): InstallOsPackage =>
      new InstallOsPackage(packageName),
  );
}

export class RemoveOsPackage extends AbstractPackageCommand<OsPackageName> {
  private constructor(packageName: OsPackageName) {
    super(packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
  }

  async run(): Promise<RunResult> {
    if (!await isInstalledOsPackage(this.packageName)) {
      return `Already removed OS package ${this.packageName}.`;
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--remove",
      "--noconfirm",
      this.packageName,
    ]);

    return `Removed package ${this.packageName}.`;
  }

  static of: (packageName: OsPackageName) => RemoveOsPackage = (
    packageName: OsPackageName,
  ) => new RemoveOsPackage(packageName);
}

export class ReplaceOsPackage extends Command {
  readonly removePackageName: OsPackageName;
  readonly installPackageName: OsPackageName;

  private constructor(
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) {
    super();
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);

    this.removePackageName = removePackageName;
    this.installPackageName = installPackageName;
  }

  async run(): Promise<RunResult> {
    if (await isInstalledOsPackage(this.removePackageName)) {
      await ensureSuccessful(ROOT, [
        "pacman",
        "--remove",
        "--noconfirm",
        "--nodeps",
        "--nodeps",
        this.removePackageName,
      ]);
    }

    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--needed",
      "--noconfirm",
      this.installPackageName,
    ]).catch(this.doneDeferred.reject);

    return `Replaced package ${this.removePackageName} with ${this.installPackageName}.`;
  }
  /**
   * @deprecated Use .of2() instead.
   */
  static of(): Command {
    throw new Error("Use .of2() instead.");
  }
  static of2: (
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) => ReplaceOsPackage = (
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) => new ReplaceOsPackage(removePackageName, installPackageName);
}

export class InstallAurPackage extends AbstractPackageCommand<AurPackageName> {
  private constructor(packageName: AurPackageName) {
    super(packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
    this.dependencies.push(InstallOsPackage.of("base-devel"));
    this.dependencies.push(InstallOsPackage.of("yay"));
  }

  async run(): Promise<RunResult> {
    if (await isInstalledAurPackage(this.packageName)) {
      return `Already installed AUR package ${this.packageName}.`;
    }

    await ensureSuccessful(targetUser, [
      "yay",
      "--sync",
      "--refresh",
      "--needed",
      "--noconfirm",
      this.packageName,
    ]);

    return `Installed AUR package ${this.packageName}.`;
  }

  static of: (packageName: AurPackageName) => InstallAurPackage = memoize(
    (packageName: AurPackageName): InstallAurPackage =>
      new InstallAurPackage(packageName),
  );
}

export class RemoveAurPackage extends AbstractPackageCommand<AurPackageName> {
  private constructor(packageName: AurPackageName) {
    super(packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
    this.dependencies.push(InstallOsPackage.of("base-devel"));
    this.dependencies.push(InstallOsPackage.of("yay"));
  }

  async run(): Promise<RunResult> {
    if (!await isInstalledAurPackage(this.packageName)) {
      return `Already removed AUR package ${this.packageName}.`;
    }

    await ensureSuccessful(targetUser, [
      "yay",
      "--remove",
      "--nosave",
      "--noconfirm",
      this.packageName,
    ]);

    return `Removed AUR package ${this.packageName}.`;
  }

  static of: (packageName: AurPackageName) => RemoveAurPackage = (
    packageName: AurPackageName,
  ) => new RemoveAurPackage(packageName);
}

export const flatpakOsPackages = ["xdg-desktop-portal-gtk", "flatpak"];
export const flatpak: Command = Command.custom()
  .withDependencies(flatpakOsPackages.map(InstallOsPackage.of));

export class InstallFlatpakPackage
  extends AbstractPackageCommand<FlatpakPackageName> {
  private constructor(packageName: FlatpakPackageName) {
    super(packageName);
    this.locks.push(FLATPAK);
    this.dependencies.push(flatpak);
  }

  async run(): Promise<RunResult> {
    if (await isInstalledFlatpakPackage(this.packageName)) {
      return `Already installed Flatpak package ${this.packageName}.`;
    }

    await ensureSuccessful(ROOT, [
      "flatpak",
      "install",
      "--or-update",
      "--noninteractive",
      ...(isInsideDocker ? ["--no-deploy"] : []),
      "flathub",
      this.packageName,
    ]);

    return `Installed Flatpak package ${this.packageName}.`;
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
    super(packageName);
    this.locks.push(FLATPAK);
    this.dependencies.push(flatpak);
  }

  async run(): Promise<RunResult> {
    if (!await isInstalledFlatpakPackage(this.packageName)) {
      return `Already removed Flatpak package ${this.packageName}.`;
    }

    await ensureSuccessful(ROOT, [
      "flatpak",
      "uninstall",
      "--noninteractive",
      this.packageName,
    ]);

    return `Removed Flatpak package ${this.packageName}.`;
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
