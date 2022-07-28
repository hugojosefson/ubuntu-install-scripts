import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallFlatpakPackage } from "./common/os-package.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:-.}
webstorm "\${arg}" &>/dev/null &
`;

export const webstorm: Command = Command
  .custom()
  .withDependencies([
    InstallFlatpakPackage.of("com.jetbrains.WebStorm"),
    addHomeBinToPath,
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/ws"),
      contents,
      false,
      MODE_EXECUTABLE_775,
    ),
  ]);
