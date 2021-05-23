import { FileSystemPath } from "../model/dependency.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { targetUser } from "../os/user/target-user.ts";
import { Exec } from "./exec.ts";
import { git } from "./git.ts";

export const fzf = async () => {
  const fileSystemPathPromise = createTempDir(targetUser);
  const tempDir: FileSystemPath = await fileSystemPathPromise;
  const cwd: string = tempDir.path;

  const gitClone = new Exec(
    [git],
    [tempDir],
    targetUser,
    { cwd },
    [
      "git",
      "clone",
      "https://github.com/junegunn/fzf",
      cwd,
    ],
  );

  return new Exec(
    [gitClone],
    [tempDir],
    targetUser,
    { cwd },
    ["./install", "--all"],
  );
};
