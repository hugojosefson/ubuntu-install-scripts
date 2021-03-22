import dropFile from "./lib/drop-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";

// Not installing package locally. Using webstorm via isolate-in-docker.
export default (): Promise<void> => {
  const ws = `#!/usr/bin/env bash
arg=\${1:-.}
webstorm "\${arg}" &>/dev/null &
`;
  return ensureAllOk([
    // ensureInstalledFlatpak("com.jetbrains.WebStorm"),
    dropFile(ws)("~/bin/ws", 0o775),
    ensureLineInFile('export PATH="~/bin:$PATH"')("~/.bashrc"),
  ]);
};
