import ensureInstalled from "./lib/ensure-installed.ts";

export default (): Promise<void> => ensureInstalled(["git"]);
