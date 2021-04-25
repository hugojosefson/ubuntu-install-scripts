import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

export const keybase = new SequentialCommand([
  InstallOsPackage.parallel(["keybase", "keybase-gui", "kbfs"]),
  new Exec(targetUser, {}, "keybase ctl autostart --enable".split(" ")),
]);
