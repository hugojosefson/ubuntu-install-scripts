import { ensureSuccessful } from "./exec.ts";

export default (packages: Array<string>): Promise<void> =>
  ensureSuccessful([
    "sudo",
    "pacman",
    "-Sy",
    "--noconfirm",
    "--needed",
    ...packages,
  ]);
