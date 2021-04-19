import { Command } from "../model/command.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const gitk: Command = new ParallelCommand([
  addHomeBinToPath,
  InstallOsPackage.multi(["git", "tk"]),
  new CreateFile(
    targetUser,
    "~/bin/gk",
    `#!/usr/bin/env bash
arg=\${1:---all}
gitk "\${arg}" &>/dev/null &
`,
    false,
    MODE_EXECUTABLE_775,
  ),
]);
