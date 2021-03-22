import dropFile from "./lib/drop-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";
import { ensureInstalledFlatpak } from "./lib/ensure-installed.ts";

const i = `#!/usr/bin/env bash
arg=\${1:-.}
idea "\${arg}" &>/dev/null &
`;

export default (): Promise<void> => {
  return ensureAllOk([
    ensureInstalledFlatpak(["com.jetbrains.IntelliJ-IDEA-Community"]),
    dropFile(i)("~/bin/i", 0o775),
    ensureLineInFile('export PATH="~/bin:$PATH"')("~/.bashrc"),
  ]);
};
