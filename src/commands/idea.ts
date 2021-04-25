import { ParallelCommand } from "./common/parallel-command.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";

const iContents = `#!/usr/bin/env bash
arg=\${1:-.}
idea "\${arg}" &>/dev/null &
`;

export const idea = new ParallelCommand([
  // Not installing package locally. Using idea via isolate-in-docker.
  // new InstallOsPackage("intellij-idea-community-edition"),
  new CreateFile(
    targetUser,
    "~/bin/i",
    iContents,
    false,
    MODE_EXECUTABLE_775,
  ),
  addHomeBinToPath,
]);
