import { debounce } from "../deps.ts";
import { defer, Deferred, resolvedVoidDefer } from "./defer.ts";
import { ensureSuccessful } from "./exec.ts";
import { toObject } from "../fn.ts";
import { installedOsPackages } from "./installed-os-packages.ts";

export type OsPackageName = string;

const installedPromises: Record<OsPackageName, Promise<void>> =
  (await installedOsPackages())
    .map((
      osPackageName: OsPackageName,
    ): [OsPackageName, Promise<void>] => [osPackageName, Promise.resolve()])
    .reduce(toObject<OsPackageName, Promise<void>>(), {});

let currentBatchDeferred: Deferred<void> = resolvedVoidDefer();
let nextBatchDeferred: Deferred<void> = defer();
let nextBatch: Array<OsPackageName> = [];

const installPending: () => void = debounce(
  async () => {
    if (!nextBatch.length) {
      return;
    }

    await currentBatchDeferred.promise;
    currentBatchDeferred = nextBatchDeferred;
    nextBatchDeferred = defer();

    const currentBatch = nextBatch;
    nextBatch = [];

    doInstallOsPackagesNow(currentBatch).then(
      currentBatchDeferred.resolve,
      currentBatchDeferred.reject,
    );

    await currentBatchDeferred.promise;
    installPending();
  },
);

export const ensureInstalledOsPackage = (
  name: OsPackageName,
): Promise<void> => {
  if (!installedPromises[name]) {
    // install os package
    installedPromises[name] = nextBatchDeferred.promise;
    nextBatch.push(name);
    installPending();
  }
  return installedPromises[name];
};

export const doUpdateOsPackages = async (): Promise<void> => {
  await ensureInstalledOsPackage("--sysupgrade");
  delete installedPromises["--sysupgrade"]; // to enable running it again
};

const doInstallOsPackagesNow = (
  osPackageNames: Array<OsPackageName> = [],
): Promise<void> =>
  osPackageNames.length
    ? ensureSuccessful([
      "sudo",
      "pacman",
      "--sync",
      "--refresh",
      "--noconfirm",
      "--needed",
      ...osPackageNames,
    ])
    : Promise.resolve();
