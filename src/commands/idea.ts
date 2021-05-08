import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:-.}
idea "\${arg}" &>/dev/null &
`;

export const idea: Command = Command.custom()
  .withDependencies([
    // Not installing package locally. Using idea via isolate-in-docker.
    // InstallOsPackage.of("intellij-idea-community-edition"),
    addHomeBinToPath,
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/i"),
      contents,
      false,
      MODE_EXECUTABLE_775,
    ),
  ]);
