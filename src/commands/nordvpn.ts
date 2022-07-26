import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallBrewPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

// TODO: sudo systemctl enable --now nordvpnd

export const nordvpn = new Exec(
  [InstallBrewPackage.of("nordvpn-bin")],
  [],
  ROOT,
  {},
  [
    "usermod",
    "-aG",
    "nordvpn",
    targetUser.username,
  ],
);
