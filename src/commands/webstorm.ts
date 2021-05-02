import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId, FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:-.}
webstorm "\${arg}" &>/dev/null &
`;

export const webstorm: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("webstorm", "webstorm"));

    this.dependencies.push(
      // Not installing package locally. Using webstorm via isolate-in-docker.
      // InstallOsPackage.of("webstorm"),
      addHomeBinToPath,
      new CreateFile(
        targetUser,
        FileSystemPath.of(targetUser, "~/bin/ws"),
        contents,
        false,
        MODE_EXECUTABLE_775,
      ),
    );
  }
}();
