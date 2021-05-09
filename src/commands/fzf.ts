import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const fzf = async () => {
  const fileSystemPathPromise = createTempDir(targetUser);
  const tempDir: FileSystemPath = await fileSystemPathPromise;
  const cwd: string = tempDir.path;

  const gitClone = new Exec(
    [InstallOsPackage.of("git")],
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

  const install = new Exec(
    [gitClone],
    [tempDir],
    targetUser,
    { cwd },
    ["./install", "--all"],
  );

  return Command.custom()
    .withDependencies([
      install,
    ]);
};
