import dropFile from "./lib/drop-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";
import ensureInstalled from "./lib/ensure-installed.ts";

const contents = `#!/usr/bin/env bash
arg=\${1:---all}
gitk "\${arg}" &>/dev/null &
`;

export default (): Promise<void> => {
  return ensureAllOk([
    ensureInstalled(["git"]),
    dropFile(contents)("~/bin/gk", 0o775),
    ensureLineInFile('export PATH="~/bin:$PATH"')("~/.bashrc"),
  ]);
};
