import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";

export const addHomeBinToPath = new LineInFile(
  targetUser,
  "~/.bashrc",
  'export PATH="~/bin:$PATH"',
);
