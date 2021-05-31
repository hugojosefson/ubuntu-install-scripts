import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallAurPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

// TODO: sudo systemctl enable --now nordvpnd

export const nordvpn = new Exec(
  [InstallAurPackage.of("nordvpn-bin")],
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
