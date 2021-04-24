import { targetUser } from "../os/user/target-user.ts";
import { SymlinkElsewhere } from "./common/file-commands.ts";

export const desktopIsHome = new SymlinkElsewhere(
  targetUser,
  `~/Desktop`,
  ".",
);
