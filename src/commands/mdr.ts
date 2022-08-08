import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { ROOT } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readFromUrlBytes } from "../os/read-from-url.ts";

export const mdr = new CreateFile(
  ROOT,
  FileSystemPath.of(ROOT, "/usr/local/bin/mdr"),
  await readFromUrlBytes(
    "https://github.com/MichaelMure/mdr/releases/download/v0.2.5/mdr_linux_amd64",
  ),
  false,
  MODE_EXECUTABLE_775,
);
