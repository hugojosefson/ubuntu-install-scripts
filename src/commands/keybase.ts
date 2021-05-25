import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

const cmds = [
  "systemctl --user enable keybase kbfs",
  "systemctl --user start keybase kbfs",
  "keybase ctl autostart --enable",
].map((s) => s.split(" "));

export const keybase = Exec.sequentialExec(
  targetUser,
  {},
  cmds,
)
  .withDependencies(
    [
      "keybase",
      "keybase-gui",
      "kbfs",
    ].map(InstallOsPackage.of),
  );
