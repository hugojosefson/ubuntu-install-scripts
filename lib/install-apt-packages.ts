import debounce from "https://cdn.skypack.dev/lodash.debounce@v4.0.8";
import defer, { Deferred } from "./defer.ts";
import installedPackages from "./installed-packages.ts";
import { ensureInstalled } from "./installer.ts";

let waiting: Array<string> = [];
const installed: Record<string, Deferred<void>> = {};

let currentBatch: Promise<void> | undefined;
const installPending = debounce(
  () => {
    if (currentBatch) {
      currentBatch.then(installPending);
    } else {
      if (waiting.length) {
        currentBatch = new Promise((resolve, reject) => {
          const aptPromise = ensureInstalled(waiting);
          waiting.forEach((name) =>
            aptPromise.then(installed[name].resolve, installed[name].reject)
          );
          aptPromise.then(resolve, reject);
          waiting = [];
        });

        currentBatch.then(() => {
          currentBatch = undefined;
          installPending();
        });
      }
    }
  },
  0,
  {},
);

/**
 * Installs one or several apt packages, returning a promise for when they have been installed.
 *
 * @param packageNames names of packages to install
 *
 * @returns {Promise} Promise for array of result objects, or rejected with single result object.
 */
export default (...packageNames: Array<string>) =>
  Promise.all(packageNames.map(installAptPackage));

export const installAptPackage = (name: string): Promise<void> => {
  if (installed[name]) {
    return installed[name].promise;
  } else {
    return new Promise((resolve, reject) => {
      installedPackages.then((packages) => {
        if (packages[name]) {
          // already installed apt package
          resolve();
        } else {
          // install apt package
          installed[name] = defer();
          waiting.push(name);
          installPending();
          installed[name].promise.then(resolve, reject);
        }
      }, reject);
    });
  }
};
