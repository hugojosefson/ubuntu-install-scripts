import { LineInFile } from "./common/file-commands.ts";

export const addHomeBinToPath = new LineInFile(
  "~/.bashrc",
  'export PATH="~/bin:$PATH"',
);
