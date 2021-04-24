import { exists } from "../deps.ts";
import { isSuccessful } from "./exec.ts";
import { ROOT } from "./user/target-user.ts";

export const isInsideDocker = await exists("/.dockerenv") ||
  await exists("/proc/self/cgroup") &&
    await isSuccessful(ROOT, ["grep", "docker", "/proc/self/cgroup"]);
