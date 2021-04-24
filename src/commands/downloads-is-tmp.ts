import { targetUser } from "../os/user/target-user.ts";
import { SymlinkElsewhere } from "./common/file-commands.ts";

export const downloadsIsTmp = new SymlinkElsewhere(
  targetUser,
  `~/Downloads`,
  "/tmp",
);
