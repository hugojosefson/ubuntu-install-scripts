import { Command } from "../model/command.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { DropExecutable } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const gitk: Command = new ParallelCommand([
  new InstallOsPackage("git"),
  new DropExecutable(
    "~/bin/gk",
    `#!/usr/bin/env bash
arg=\${1:---all}
gitk "\${arg}" &>/dev/null &
`,
  ),
  addHomeBinToPath,
]);
