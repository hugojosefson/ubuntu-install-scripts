import { isInsideDocker } from "../os/is-inside-docker.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

const activateAndTest = new SequentialCommand([
  Exec.sequential(ROOT, {}, [
    ["systemctl", "enable", "docker.service"],
    ["systemctl", "start", "docker.service"],
    ["docker", "version"],
  ]),
  new Exec(targetUser, {}, ["docker", "run", "--rm", "hello-world"]),
]);

export const docker = new SequentialCommand([
  new InstallOsPackage("docker"),
  new Exec(ROOT, {}, ["usermod", "-aG", "docker", targetUser.username]),
  ...(isInsideDocker ? [] : [activateAndTest]),
]);
