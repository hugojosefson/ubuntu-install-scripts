import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallAurPackage } from "./common/os-package.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

export const nordvpn = new SequentialCommand([
  new InstallAurPackage("nordvpn-bin"),
  new Exec(ROOT, {}, ["usermod", "-aG", "nordvpn", targetUser.username]),
]);
