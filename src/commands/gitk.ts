import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:---all}
gitk "\${arg}" &>/dev/null &
`;

export const gitk: Command = Command.custom("gitk")
  .withDependencies([
    addHomeBinToPath,
    InstallOsPackage.of("git"),
    InstallOsPackage.of("tk"),
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/gk"),
      contents,
      false,
      MODE_EXECUTABLE_775,
    ),
  ]);
