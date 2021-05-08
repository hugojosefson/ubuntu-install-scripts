import { Command } from "../model/command.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { UserInGroup } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

const addUserToDockerGroup = new UserInGroup(targetUser, "docker")
  .withDependencies([
    InstallOsPackage.of("docker"),
  ]);

const installDocker = Command
  .custom()
  .withDependencies([
    InstallOsPackage.of("docker"),
    InstallOsPackage.of("docker-compose"),
    addUserToDockerGroup,
  ]);

const activateDocker = Command
  .custom()
  .withDependencies([
    installDocker,
  ])
  .withRun(async () => {
    await ensureSuccessful(ROOT, ["systemctl", "enable", "docker.service"]);
    await ensureSuccessful(ROOT, ["systemctl", "start", "docker.service"]);
    await ensureSuccessful(ROOT, ["docker", "version"]);
  });

const testDocker = Command
  .custom()
  .withDependencies([
    activateDocker,
    addUserToDockerGroup,
  ])
  .withRun(() =>
    ensureSuccessful(targetUser, [
      "docker",
      "run",
      "--rm",
      "hello-world",
    ])
  );

export const docker = Command
  .custom()
  .withDependencies(
    isInsideDocker
      ? [installDocker]
      : [installDocker, activateDocker, testDocker],
  );
