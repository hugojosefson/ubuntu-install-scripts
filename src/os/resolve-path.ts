import { PasswdEntry } from "../deps.ts";

export const resolvePath = (
  user: PasswdEntry,
  path: string,
): string => path.replace("~", user.homedir);
