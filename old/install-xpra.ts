import { ensureInstalled } from "./lib/install-flatpak-package.ts";

export default (): Promise<void> => ensureInstalled(["xpra"]);
