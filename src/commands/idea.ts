import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallSnapPackage } from "./common/os-package.ts";

const iContents = `#!/usr/bin/env bash
arg=\${1:-.}
idea "\${arg}" &>/dev/null &
`;

const ideaContents = `#!/usr/bin/env bash
exec intellij-idea-community "\${@}"
`;

export const idea: Command = Command.custom()
  .withDependencies([
    InstallSnapPackage.ofClassic("intellij-idea-community"),
    new CreateFile(
      ROOT,
      FileSystemPath.of(ROOT, "/usr/local/bin/idea"),
      ideaContents,
      true,
      MODE_EXECUTABLE_775,
    ),
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/bin/i"),
      iContents,
      false,
      MODE_EXECUTABLE_775,
    ).withDependencies([addHomeBinToPath]),
  ]);
