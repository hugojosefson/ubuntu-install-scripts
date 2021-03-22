import { isSuccessful } from "./exec.ts";

export default async (packageName: string): Promise<boolean> =>
  isSuccessful(["pacman", "-Qi", packageName]);
