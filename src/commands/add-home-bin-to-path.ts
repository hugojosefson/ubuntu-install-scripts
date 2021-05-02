import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";

export const addHomeBinToPath = new LineInFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/.bashrc"),
  'export PATH="~/bin:$PATH"',
);
