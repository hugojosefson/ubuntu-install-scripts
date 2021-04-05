import { Command } from "../model/command.ts";
import { DropExecutable, LineInFile } from "./common/file-commands.ts";
import { OsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const gitk: Command = new ParallelCommand([
  new OsPackage("git"),
  new DropExecutable(
    "~/bin/gk",
    `#!/usr/bin/env bash
arg=\${1:---all}
gitk "\${arg}" &>/dev/null &
`,
  ),
  new LineInFile("~/.bashrc", 'export PATH="~/bin:$PATH"'),
]);
