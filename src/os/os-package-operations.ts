import { defer, Deferred } from "./defer.ts";
import { ensureSuccessful, isSuccessful } from "./exec.ts";
import { ROOT, targetUser } from "./user/target-user.ts";

export type PackageOperationType =
  | "noop"
  | "os_install"
  | "os_remove"
  | "aur_install"
  | "aur_remove";
const RUN_DELAY = 10;

export type OsPackageName = string;
export type AurPackageName = string;
export type PackageName = OsPackageName | AurPackageName;

export const ensureInstalledOsPackage = (
  name: OsPackageName,
): Promise<void> => enqueue("os_install", name);

export const ensureRemovedOsPackage = (
  name: OsPackageName,
): Promise<void> => enqueue("os_remove", name);

export const ensureInstalledAurPackage = (
  name: AurPackageName,
): Promise<void> => enqueue("aur_install", name);

export const ensureRemovedAurPackage = (
  name: AurPackageName,
): Promise<void> => enqueue("aur_remove", name);

export const upgradeOsPackages = () => ensureInstalledOsPackage("--sysupgrade");

class PackageOperationQueue {
  private pendingOperation: PackageOperation<any> = new NoopPackageOperation();

  private canAppendType(type: PackageOperationType): boolean {
    return this.pendingOperation.isAppendable &&
      this.pendingOperation.type === type;
  }

  enqueue<T extends PackageOperationType>(
    type: T,
    packageName: PackageName,
  ): Promise<void> {
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
      "bash",
      "-c",
      "yes | pacman --sync --refresh --needed " +
      this.packageNames.join(" "),
    ]);
  }
}

const isInstalledOsPackages = async (
  packageNames: Array<OsPackageName>,
): Promise<boolean> =>
  await isSuccessful(targetUser, [
    "pacman",
    "--query",
    "--info",
    ...packageNames,
  ]);
const isInstalledAurPackages = async (
  packageNames: Array<AurPackageName>,
): Promise<boolean> =>
  await isSuccessful(targetUser, [
    "yay",
    "--query",
    "--info",
    ...packageNames,
  ]);

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

const createPackageOperation = <T extends PackageOperationType>(
  waitUntilAfter: Promise<void>,
  type: T,
):
  | NoopPackageOperation
  | InstallOsPackageOperation
  | RemoveOsPackageOperation
  | InstallAurPackageOperation
  | RemoveAurPackageOperation => {
  if (type === "noop") return new NoopPackageOperation();
  if (type === "os_install") {
    return new InstallOsPackageOperation(waitUntilAfter);
  }
  if (type === "os_remove") return new RemoveOsPackageOperation(waitUntilAfter);
  if (type === "aur_install") {
    return new InstallAurPackageOperation(waitUntilAfter);
  }
  if (type === "aur_remove") {
    return new RemoveAurPackageOperation(waitUntilAfter);
  }
  throw new Error(
    `ERROR: Unknown OsPackageOperationType ${type}. Can't construct it.`,
  );
};

const queueInstance: PackageOperationQueue = new PackageOperationQueue();
export const enqueue = <T extends PackageOperationType>(
  type: T,
  osPackageName: OsPackageName,
): Promise<void> => queueInstance.enqueue(type, osPackageName);
