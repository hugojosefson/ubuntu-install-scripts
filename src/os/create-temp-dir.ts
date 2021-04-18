import { PasswdEntry } from "../deps.ts";
import { ensureSuccessfulStdOut } from "./exec.ts";

export const createTempDir = (asUser: PasswdEntry): Promise<string> =>
  ensureSuccessfulStdOut(asUser, ["mktemp", "-d"]);
