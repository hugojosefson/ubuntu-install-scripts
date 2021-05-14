import { PasswdEntry } from "../deps.ts";

export function resolvePath(
  user: PasswdEntry,
  path: string,
): string {
  return path.replace("~", user.homedir);
}
