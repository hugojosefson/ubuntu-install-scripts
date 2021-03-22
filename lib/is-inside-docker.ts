import { exists } from "https://deno.land/std@0.91.0/fs/mod.ts";
import { isSuccessful } from "./exec.ts";

export default async (): Promise<boolean> =>
  await exists("/.dockerenv") ||
  await exists("/proc/self/cgroup") &&
    await isSuccessful(["grep", "docker", "/proc/self/cgroup"]);
