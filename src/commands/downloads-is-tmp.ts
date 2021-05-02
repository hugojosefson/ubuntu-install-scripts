import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { Symlink } from "./common/file-commands.ts";

export const downloadsIsTmp = new Symlink(
  targetUser,
  "/tmp",
  FileSystemPath.of(targetUser, `~/Downloads`),
);
