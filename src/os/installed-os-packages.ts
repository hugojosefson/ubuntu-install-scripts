import { ensureSuccessfulStdOut } from "./exec.ts";
import { OsPackageName } from "./install-os-package.ts";

/**
 * Promise for an array of currently installed OS package names.
 */
export const installedOsPackages = async (): Promise<Array<OsPackageName>> => {
  const stdout: string = await ensureSuccessfulStdOut(["pacman", "-Qqe"]);
  return stdout
    .trim()
    .split("\n");
};
