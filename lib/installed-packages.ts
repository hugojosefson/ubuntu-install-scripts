import { ensureSuccessfulStdOut } from "./exec.ts";
import { toObject } from "./fn.ts";

/**
 * Promise for an object where keys are currently installed
 * packages, and values are true.
 */
export default ensureSuccessfulStdOut(["pacman", "-Qqe"]).then((
  stdout: string,
): Record<string, true> =>
  stdout
    .trim()
    .split("\n")
    .map((pkg: string): [string, true] => [pkg, true])
    .reduce(
      toObject<string, true>(),
      {},
    )
);
