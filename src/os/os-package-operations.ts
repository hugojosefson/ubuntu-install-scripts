import { defer, Deferred } from "./defer.ts";
import { ensureSuccessful } from "./exec.ts";

export type OsPackageOperationType = "noop" | "install" | "remove";
const RUN_DELAY = 10;

export type OsPackageName = string;

export const ensureInstalledOsPackage = (
  name: OsPackageName,
): Promise<void> => enqueue("install", name);

export const ensureRemovedOsPackage = (
  name: OsPackageName,
): Promise<void> => enqueue("remove", name);

export const upgradeOsPackages = () => ensureInstalledOsPackage("--sysupgrade");

class OsPackageOperationQueue {
  private pendingOperation: OsPackageOperation<any> =
    new NoopOsPackageOperation();
  private canAppendType(type: OsPackageOperationType): boolean {
    return this.pendingOperation.isAppendable &&
      this.pendingOperation.type === type;
  }
  enqueue<T extends OsPackageOperationType>(
    type: T,
    osPackageName: OsPackageName,
  ): Promise<void> {
    if (!this.canAppendType(type)) {
      this.pendingOperation = createOsPackageOperation(
        this.pendingOperation.deferred.promise,
        type,
      );
    }
    this.pendingOperation.append(osPackageName);
    return this.pendingOperation.deferred.promise;
  }
}

interface OsPackageOperation<T extends OsPackageOperationType> {
  readonly deferred: Deferred<void>;
  readonly type: T;
  isAppendable: boolean;
  append(packageName: OsPackageName): void;
  run(): Promise<void>;
}

abstract class AbstractOsPackageOperation<T extends OsPackageOperationType>
  implements OsPackageOperation<T> {
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
  abstract append(packageName: OsPackageName): void;

  toString() {
    return `AbstractOsPackageOperation<${this.type}>{` + JSON.stringify({
      isAppendable: this.isAppendable,
    }) + "}";
  }
}

class NoopOsPackageOperation extends AbstractOsPackageOperation<"noop"> {
  constructor() {
    super(Promise.resolve(), "noop");
    this.deferred.resolve();
  }

  async run(): Promise<void> {
  }

  append(packageName: OsPackageName): void {
  }
}

abstract class AbstractActiveOsPackageOperation<
  T extends Exclude<OsPackageOperationType, "noop">,
> extends AbstractOsPackageOperation<T> {
  protected readonly osPackageNames: Array<OsPackageName> = [];

  append(packageName: OsPackageName) {
    if (!this.isAppendable) {
      throw new Error(
        `ERROR: Could not append ${packageName} to ${this.toString()}`,
      );
    }
    this.clearTimeout();
    this.osPackageNames.push(packageName);
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
    return `OsPackageOperation<${this.type}>{` + JSON.stringify({
      isAppendable: this.isAppendable,
      packageNames: this.osPackageNames,
    }) + "}";
  }
}

class InstallOsPackageOperation
  extends AbstractActiveOsPackageOperation<"install"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "install");
  }

  async run(): Promise<void> {
    return await ensureSuccessful([
      "sudo",
      "pacman",
      "--sync",
      "--refresh",
      "--noconfirm",
      "--needed",
      ...this.osPackageNames,
    ]);
  }
}

class RemoveOsPackageOperation
  extends AbstractActiveOsPackageOperation<"remove"> {
  constructor(waitUntilAfter: Promise<void>) {
    super(waitUntilAfter, "remove");
  }
  async run(): Promise<void> {
    return await ensureSuccessful([
      "sudo",
      "pacman",
      "--remove",
      "--noconfirm",
      ...this.osPackageNames,
    ]);
  }
}

const createOsPackageOperation = <T extends OsPackageOperationType>(
  waitUntilAfter: Promise<void>,
  type: T,
):
  | NoopOsPackageOperation
  | InstallOsPackageOperation
  | RemoveOsPackageOperation => {
  if (type === "noop") return new NoopOsPackageOperation();
  if (type === "install") return new InstallOsPackageOperation(waitUntilAfter);
  if (type === "remove") return new RemoveOsPackageOperation(waitUntilAfter);
  throw new Error(
    `ERROR: Unknown OsPackageOperationType ${type}. Can't construct it.`,
  );
};

const queueInstance: OsPackageOperationQueue = new OsPackageOperationQueue();
export const enqueue = <T extends OsPackageOperationType>(
  type: T,
  osPackageName: OsPackageName,
): Promise<void> => queueInstance.enqueue(type, osPackageName);
