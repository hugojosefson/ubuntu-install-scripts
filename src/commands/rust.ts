import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const rust = new Exec(
  [InstallOsPackage.of("base-devel")],
  [],
  targetUser,
  {},
  ["sh", "-c", "curl -fsSL https://sh.rustup.rs | sh -s -- -y"],
);
