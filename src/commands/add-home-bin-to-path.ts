import { getTargetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";

export const addHomeBinToPath = new LineInFile(
  await getTargetUser(),
  "~/.bashrc",
  'export PATH="~/bin:$PATH"',
);
