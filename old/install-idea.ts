import { dropExecutable } from "./lib/create-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";
import { ensureInstalledFlatpak } from "./lib/install-flatpak-package.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:-.}
idea "\${arg}" &>/dev/null &
`;

export default (): Promise<void> => {
  return ensureAllOk([
    ensureInstalledFlatpak(["com.jetbrains.IntelliJ-IDEA-Community"]),
    dropExecutable(contents)("~/bin/i"),
    ensureLineInFile('export PATH="~/bin:$PATH"')("~/.bashrc"),
  ]);
};
