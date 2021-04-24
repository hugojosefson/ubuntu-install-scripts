import { ParallelCommand } from "./common/parallel-command.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";

const wsContents = `#!/usr/bin/env bash
arg=\${1:-.}
webstorm "\${arg}" &>/dev/null &
`;

export const webstorm = new ParallelCommand([
  // Not installing package locally. Using webstorm via isolate-in-docker.
  // new InstallAurPackage("webstorm"),
  new CreateFile(
    targetUser,
    "~/bin/ws",
    wsContents,
    false,
    MODE_EXECUTABLE_775,
  ),
  addHomeBinToPath,
]);
