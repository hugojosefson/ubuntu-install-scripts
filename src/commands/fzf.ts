import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateDir } from "./common/file-commands.ts";
import { Exec } from "./exec.ts";
import { git } from "./git.ts";

export const fzf = async () => {
  const installDir = FileSystemPath.of(targetUser, "~/.fzf");

  const deleteDir = new Exec(
    [new CreateDir(targetUser, installDir)],
    [installDir],
    targetUser,
    {},
    [
      "rm",
      "-rf",
      "--",
      installDir.path,
    ],
  );
  const gitClone = new Exec(
    [git, deleteDir],
    [installDir],
    targetUser,
    {},
    [
      "git",
      "clone",
      "https://github.com/junegunn/fzf",
      installDir.path,
    ],
  );

  return new Exec(
    [gitClone],
    [installDir],
    targetUser,
    { cwd: installDir.path },
    ["./install", "--all"],
  );
};
