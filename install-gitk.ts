import { dropExecutable } from "./lib/drop-file.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";
import { ensureInstalled } from "./lib/installer.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:---all}
gitk "\${arg}" &>/dev/null &
`;

export default (): Promise<void> => {
  return ensureAllOk([
    ensureInstalled(["git"]),
    dropExecutable(contents)("~/bin/gk"),
    ensureLineInFile('export PATH="~/bin:$PATH"')("~/.bashrc"),
  ]);
};
