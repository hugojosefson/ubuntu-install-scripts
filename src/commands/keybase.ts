import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const keybase = new Exec(
  ["keybase", "keybase-gui", "kbfs"].map(InstallOsPackage.of),
  [],
  targetUser,
  {},
  "keybase ctl autostart --enable".split(" "),
);
