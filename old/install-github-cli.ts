import { ensureInstalled } from "./lib/installer.ts";

export default (): Promise<void> => ensureInstalled(["github-cli"]);
