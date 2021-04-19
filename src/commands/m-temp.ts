import { fetchFile } from "../deps.ts";
import { getTargetUser } from "../os/user/target-user.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const mTemp = new ParallelCommand([
  new InstallOsPackage("gettext"),
  new CreateFile(
    await getTargetUser(),
    "~/bin/m-temp",
    await (await fetchFile(new URL("./files/m-temp", import.meta.url))).text(),
    MODE_EXECUTABLE_775,
  ),
]);
