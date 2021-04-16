import { dropExecutable } from "./lib/create-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:-.}
webstorm "\${arg}" &>/dev/null &
`;

export default (): Promise<void> => {
  return ensureAllOk([
    // ensureInstalledFlatpak(["com.jetbrains.WebStorm"]), // Not installing package locally. Using webstorm via isolate-in-docker.
    dropExecutable(contents)("~/bin/ws"),
    ensureLineInFile('export PATH="~/bin:$PATH"')("~/.bashrc"),
  ]);
};
