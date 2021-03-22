import { ensureSuccessful } from "./exec.ts";

export default (packages: Array<string> = []): Promise<void> =>
  !!packages.length
    ? ensureSuccessful([
      "sudo",
      "pacman",
      "-Sy",
      "--noconfirm",
      "--needed",
      ...packages,
    ])
    : Promise.resolve();
