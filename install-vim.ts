import { ensureInstalled } from "./lib/installer.ts";
import ensureLineInFile from "./lib/ensure-line-in-file.ts";
import { ensureAllOk } from "./lib/ensure-ok.ts";

export default (): Promise<void> =>
  ensureAllOk([
    ensureInstalled(["vim"]),
    ensureLineInFile("EDITOR=vim")("/etc/environment"),
  ]);