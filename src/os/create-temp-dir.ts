import { config } from "../config.ts";
import { colorlog, PasswdEntry } from "../deps.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ensureSuccessfulStdOut } from "./exec.ts";

export async function createTempDir(
  asUser: PasswdEntry,
): Promise<FileSystemPath> {
  const path = await ensureSuccessfulStdOut(asUser, ["mktemp", "-d"]);
  const fileSystemPath = FileSystemPath.of(asUser, path);
  config.VERBOSE && console.warn(
    colorlog.warning(
      `createTempDir: fileSystemPath: ${JSON.stringify(fileSystemPath)}`,
    ),
  );
  return fileSystemPath;
}
