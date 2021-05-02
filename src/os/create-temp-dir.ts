import { PasswdEntry } from "../deps.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ensureSuccessfulStdOut } from "./exec.ts";

export const createTempDir = async (
  asUser: PasswdEntry,
): Promise<FileSystemPath> => {
  const path = await ensureSuccessfulStdOut(asUser, ["mktemp", "-d"]);
  return FileSystemPath.of(asUser, path);
};
