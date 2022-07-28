import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallFlatpakPackage } from "./common/os-package.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:-.}
idea "\${arg}" &>/dev/null &
`;

export const idea: Command = Command.custom()
  .withDependencies([
    InstallFlatpakPackage.of("com.jetbrains.IntelliJ-IDEA-Community"),
    addHomeBinToPath,
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/i"),
      contents,
      false,
      MODE_EXECUTABLE_775,
    ),
  ]);
