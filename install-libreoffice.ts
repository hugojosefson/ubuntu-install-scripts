import ensureInstalled from "./lib/ensure-installed.ts";

export default (): Promise<void> =>
  ensureInstalled([
    "libreoffice-fresh",
    "libreoffice-fresh-en-gb",
    "libreoffice-fresh-sv",
  ]);
