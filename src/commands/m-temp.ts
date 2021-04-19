import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const mTemp = new ParallelCommand([
  new InstallOsPackage("gettext"),
  new CreateFile(
    targetUser,
    "~/bin/m-temp",
    await readRelativeFile("./files/m-temp", import.meta.url),
    false,
    MODE_EXECUTABLE_775,
  ),
]);
