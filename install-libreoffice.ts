import { ensureInstalled } from "./lib/installer.ts";

export default (): Promise<void> =>
  ensureInstalled([
    "libreoffice-fresh",
    "libreoffice-fresh-en-gb",
    "libreoffice-fresh-sv",
  ]);
