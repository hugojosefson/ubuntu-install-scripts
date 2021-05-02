import { defer, Deferred } from "./defer.ts";
import { ensureSuccessful, isSuccessful } from "./exec.ts";
import { isInsideDocker } from "./is-inside-docker.ts";
import { ROOT, targetUser } from "./user/target-user.ts";

export type PackageOperationType =
  | "noop"
  | "os_refresh"
  | "os_install"
  | "os_remove"
  | "os_replace"
  | "aur_install"
  | "aur_remove"
  | "flatpak_install"
  | "flatpak_remove";
const RUN_DELAY = 10;

export type OsPackageName = string;
export type AurPackageName = string;
export type FlatpakPackageName = string;
export type PackageName = OsPackageName | AurPackageName | FlatpakPackageName;

export const ensureRefreshedOsPackages = (): Promise<void> =>
  enqueue("os_refresh");

export const ensureInstalledOsPackage = (
  name: OsPackageName,
): Promise<void> => enqueue("os_install", name);

export const ensureRemovedOsPackage = (
  name: OsPackageName,
): Promise<void> => enqueue("os_remove", name);

export const ensureReplacedOsPackage = (
  removePackageName: OsPackageName,
  installPackageName: OsPackageName,
): Promise<void> =>
  enqueue("os_replace", removePackageName, installPackageName);

export const ensureInstalledAurPackage = (
  name: AurPackageName,
): Promise<void> => enqueue("aur_install", name);

export const ensureRemovedAurPackage = (
  name: AurPackageName,
): Promise<void> => enqueue("aur_remove", name);

export const ensureInstalledFlatpakPackage = (
  name: FlatpakPackageName,
): Promise<void> => enqueue("flatpak_install", name);

export const ensureRemovedFlatpakPackage = (
  name: FlatpakPackageName,
): Promise<void> => enqueue("flatpak_remove", name);

export const upgradeOsPackages = () => ensureInstalledOsPackage("--sysupgrade");
export const refreshOsPackages = () => ensureRefreshedOsPackages();

class PackageOperationQueue {
  private pendingOperation: PackageOperation<any> = new NoopPackageOperation();

  private canAppendType(type: PackageOperationType): boolean {
    return type !== "os_replace" && this.pendingOperation.isAppendable &&
      this.pendingOperation.type === type;
  }

  enqueue(type: "os_refresh"): Promise<void>;
  enqueue(
    type: "os_replace",
    removeOsPackageName: OsPackageName,
    installOsPackageName: OsPackageName,
  ): Promise<void>;
  enqueue<T extends Exclude<PackageOperationType, "os_replace" | "os_refresh">>(
    type: T,
    packageName: PackageName,
  ): Promise<void>;
  enqueue<T extends PackageOperationType>(
    type: T,
    packageName?: PackageName,
    packageName2?: PackageName,
  ): Promise<void> {
    if (type === "os_refresh") {
      this.pendingOperation = createPackageOperation(
        this.pendingOperation.deferred.promise,
        type,
      );
      this.pendingOperation.append("hack, to cause the operation to trigger");
      return this.pendingOperation.deferred.promise;
    }
    if (!packageName) {
      throw new Error(
        "Unexpected: packageName should be specified.",
      );
    }
    if (type === "os_replace") {
      if (!packageName2) {
        throw new Error(
          "Unexpected: packageName2 should be specified.",
        );
      }
      this.pendingOperation = createPackageOperation(
        this.pendingOperation.deferred.promise,
        type,
      );
      this.pendingOperation.append(packageName);
      this.pendingOperation.append(packageName2);
      return this.pendingOperation.deferred.promise;
    }
    if (!this.canAppendType(type)) {
      this.pendingOperation = createPackageOperation(
        this.pendingOperation.deferred.promise,
        type,
      );
    }
    this.pendingOperation.append(packageName);
    return this.pendingOperation.deferred.promise;
  }
}

interface PackageOperation<T extends PackageOperationType> {
  readonly deferred: Deferred<void>;
  readonly type: T;
  isAppendable: boolean;
  append(packageName: PackageName): void;
  run(): Promise<void>;
}

abstract class AbstractPackageOperation<T extends PackageOperationType>
  implements PackageOperation<T> {
  protected timeoutId?: number;
  protected waitUntilAfter: Promise<void>;

  protected clearTimeout() {
    if (typeof this.timeoutId === "number") {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  readonly deferred: Deferred<void> = defer<void>();
  readonly type: T;
  isAppendable = true;

  constructor(waitUntilAfter: Promise<void>, type: T) {
    this.waitUntilAfter = waitUntilAfter;
    this.type = type;
  }

  abstract run(): Promise<void>;
  abstract append(packageName: PackageName): void;

  toString() {
    return `AbstractPackageOperation<${this.type}>{` + JSON.stringify({
      isAppendable: this.isAppendable,
    }) + "}";
  }
}

class NoopPackageOperation extends AbstractPackageOperation<"noop"> {
  constructor() {
    super(Promise.resolve(), "noop");
    this.deferred.resolve();
  }

  async run(): Promise<void> {
  }

  append(packageName: PackageName): void {
  }
}

abstract class AbstractActivePackageOperation<
  T extends Exclude<PackageOperationType, "noop">,
> extends AbstractPackageOperation<T> {
  protected readonly packageNames: Array<PackageName> = [];

  append(packageName: PackageName) {
    if (!this.isAppendable) {
      throw new Error(
        `ERROR: Could not append ${packageName} to ${this.toString()}`,
      );
    }
    this.clearTimeout();
    this.packageNames.push(packageName);
    const handler = () => {
      this.isAppendable = false;
      this.waitUntilAfter.then(
        () => this.run().then(this.deferred.resolve, this.deferred.reject),
        this.deferred.reject,
      );
    };
    this.timeoutId = setTimeout(handler, RUN_DELAY);
  }

  toString() {
    return `PackageOperation<${this.type}>{` + JSON.stringify({
      isAppendable: this.isAppendable,
      packageNames: this.packageNames,
    }) + "}";
  }
}

class RefreshOsPackagesOperation
  extends AbstractActivePackageOperation<"os_refresh"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "os_refresh");
  }

  async run(): Promise<void> {
    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--refresh",
    ]);
  }
}

class InstallOsPackageOperation
  extends AbstractActivePackageOperation<"os_install"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "os_install");
  }

  async run(): Promise<void> {
    if (await isInstalledOsPackages(this.packageNames)) {
      return;
    }
    await ensureSuccessful(ROOT, [
      "pacman",
      "--sync",
      "--refresh",
      "--needed",
      "--noconfirm",
      ...this.packageNames,
    ]);
  }
}

const isInstalledOsPackages = async (
  packageNames: Array<OsPackageName>,
): Promise<boolean> =>
  (await Promise.all(
    packageNames.map(async (packageName) =>
      await isInstalledOsPackage(packageName)
    ),
  )).reduce((acc, curr) => acc && curr, true);

const isInstalledOsPackage = async (
  packageName: OsPackageName,
): Promise<boolean> =>
  await isSuccessful(ROOT, [
    "bash",
    "-c",
    `pacman --query --info ${packageName} | grep -E '^Name +: ${packageName}$'`,
  ], { verbose: false });

const isInstalledAurPackages = async (
  packageNames: Array<AurPackageName>,
): Promise<boolean> =>
  await isSuccessful(targetUser, [
    "yay",
    "--query",
    "--info",
    ...packageNames,
  ], { verbose: false });

const isInstalledFlatpakPackages = async (
  packageNames: Array<FlatpakPackageName>,
): Promise<boolean> =>
  (await Promise.all(
    packageNames.map(async (packageName) =>
      await isSuccessful(ROOT, [
        "bash",
        "-c",
        `flatpak list --columns application | grep --line-regexp '${packageName}'`,
      ], { verbose: false })
    ),
  )).reduce((acc, curr) => acc && curr, true);

class RemoveOsPackageOperation
  extends AbstractActivePackageOperation<"os_remove"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "os_remove");
  }
  async run(): Promise<void> {
    if (!await isInstalledOsPackages(this.packageNames)) {
      return;
    }
    await ensureSuccessful(ROOT, [
      "pacman",
      "--remove",
      "--noconfirm",
      ...this.packageNames,
    ]);
  }
}

class ReplaceOsPackageOperation
  extends AbstractActivePackageOperation<"os_replace"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "os_replace");
  }
  async run(): Promise<void> {
    const [removeOsPackageName, installOsPackageName] = this.packageNames;
    if (await isInstalledOsPackages([removeOsPackageName])) {
      await ensureSuccessful(ROOT, [
        "pacman",
        "--remove",
        "--noconfirm",
        "--nodeps",
        "--nodeps",
        removeOsPackageName,
      ]);
    }
    await installOsPackagesImmediately([installOsPackageName]);
  }
}

const installOsPackagesImmediately = (osPackageNames: Array<OsPackageName>) => {
  const installOsPackageOperation = new InstallOsPackageOperation(
    Promise.resolve(),
  );
  osPackageNames.forEach((osPackageName) =>
    installOsPackageOperation.append(osPackageName)
  );
  return installOsPackageOperation.deferred.promise;
};

class InstallAurPackageOperation
  extends AbstractActivePackageOperation<"aur_install"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "aur_install");
  }

  async run(): Promise<void> {
    await installOsPackagesImmediately(["base-devel", "yay"]);
    if (await isInstalledAurPackages(this.packageNames)) {
      return;
    }
    await ensureSuccessful(targetUser, [
      "yay",
      "--sync",
      "--refresh",
      "--noconfirm",
      "--needed",
      ...this.packageNames,
    ]);
  }
}

class RemoveAurPackageOperation
  extends AbstractActivePackageOperation<"aur_remove"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "aur_remove");
  }
  async run(): Promise<void> {
    await installOsPackagesImmediately(["base-devel", "yay"]);
    if (!await isInstalledAurPackages(this.packageNames)) {
      return;
    }
    await ensureSuccessful(targetUser, [
      "yay",
      "--remove",
      "--nosave",
      "--noconfirm",
      ...this.packageNames,
    ]);
  }
}

export const flatpakOsPackages = ["xdg-desktop-portal-gtk", "flatpak"];

class InstallFlatpakPackageOperation
  extends AbstractActivePackageOperation<"flatpak_install"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "flatpak_install");
  }

  async run(): Promise<void> {
    await installOsPackagesImmediately(flatpakOsPackages);
    await ensureSuccessful(ROOT, [
      "flatpak",
      "install",
      "--or-update",
      "--noninteractive",
      ...(isInsideDocker ? ["--no-deploy"] : []),
      "flathub",
      ...this.packageNames,
    ]);
  }
}

class RemoveFlatpakPackageOperation
  extends AbstractActivePackageOperation<"flatpak_remove"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "flatpak_remove");
  }
  async run(): Promise<void> {
    await installOsPackagesImmediately(flatpakOsPackages);
    if (!await isInstalledFlatpakPackages(this.packageNames)) {
      return;
    }
    await ensureSuccessful(ROOT, [
      "flatpak",
      "uninstall",
      "--noninteractive",
      ...this.packageNames,
    ]);
  }
}

const createPackageOperation = <T extends PackageOperationType>(
  waitUntilAfter: Promise<void>,
  type: T,
):
  | NoopPackageOperation
  | RefreshOsPackagesOperation
  | InstallOsPackageOperation
  | RemoveOsPackageOperation
  | ReplaceOsPackageOperation
  | InstallAurPackageOperation
  | RemoveAurPackageOperation
  | InstallFlatpakPackageOperation
  | RemoveFlatpakPackageOperation => {
  if (type === "noop") return new NoopPackageOperation();
  if (type === "os_refresh") {
    return new RefreshOsPackagesOperation(waitUntilAfter);
  }
  if (type === "os_install") {
    return new InstallOsPackageOperation(waitUntilAfter);
  }
  if (type === "os_remove") {
    return new RemoveOsPackageOperation(waitUntilAfter);
  }
  if (type === "os_replace") {
    return new ReplaceOsPackageOperation(waitUntilAfter);
  }
  if (type === "aur_install") {
    return new InstallAurPackageOperation(waitUntilAfter);
  }
  if (type === "aur_remove") {
    return new RemoveAurPackageOperation(waitUntilAfter);
  }
  if (type === "flatpak_install") {
    return new InstallFlatpakPackageOperation(waitUntilAfter);
  }
  if (type === "flatpak_remove") {
    return new RemoveFlatpakPackageOperation(waitUntilAfter);
  }
  throw new Error(
    `ERROR: Unknown OsPackageOperationType ${type}. Can't construct it.`,
  );
};

const queueInstance: PackageOperationQueue = new PackageOperationQueue();
export function enqueue(
  type: "os_replace",
  removeOsPackageName: OsPackageName,
  installOsPackageName: OsPackageName,
): Promise<void>;
export function enqueue(type: "os_refresh"): Promise<void>;
export function enqueue<
  T extends Exclude<PackageOperationType, "os_replace" | "os_refresh">,
>(
  type: T,
  osPackageName: OsPackageName,
): Promise<void>;
export function enqueue<T extends PackageOperationType>(
  type: T,
  osPackageName?: OsPackageName,
  osPackageName2?: OsPackageName,
): Promise<void> {
  if (type === "os_refresh") {
    return queueInstance.enqueue("os_refresh");
  }
  if (type === "os_replace") {
    if (!osPackageName) {
      throw new Error("Unexpected: removeOsPackageName must be specified.");
    }
    if (!osPackageName2) {
      throw new Error("Unexpected: installOsPackageName must be specified.");
    }
    return queueInstance.enqueue("os_replace", osPackageName, osPackageName2);
  }
  if (!osPackageName) {
    throw new Error("Unexpected: osPackageName must be specified.");
  }
  return queueInstance.enqueue(
    type as Exclude<PackageOperationType, "os_replace" | "os_refresh">,
    osPackageName,
  );
}
