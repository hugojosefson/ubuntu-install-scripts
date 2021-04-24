import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

export const docker = new SequentialCommand([
  InstallOsPackage.parallel(["docker"]),
  ...[
    ["systemctl", "enable", "docker.service"],
    ["systemctl", "start", "docker.service"],
    ["docker", "version"],
    ["usermod", "-aG", "docker", targetUser.username],
  ].map((cmd) => new Exec(ROOT, {}, cmd)),
  new Exec(targetUser, {}, ["docker", "run", "--rm", "hello-world"]),
]);
