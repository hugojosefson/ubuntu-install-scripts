import { Command } from "../model/command.ts";
import { ensureSuccessful, isSuccessful } from "../os/exec.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { UserInGroup } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { isDocker } from "../deps.ts";

const installDocker = new Exec(
  [InstallOsPackage.of("curl")],
  [OS_PACKAGE_SYSTEM],
  ROOT,
  {},
  ["bash", "-c", "curl -fsSL https://get.docker.com | sh"],
)
  .withSkipIfAll([
    () => isSuccessful(ROOT, ["docker", "--version"]),
  ]);

const startDocker = new Exec(
  [installDocker],
  [],
  ROOT,
  {},
  ["systemctl", "start", "docker"],
)
  .withSkipIfAll([() => isSuccessful(ROOT, ["docker", "ps"])]);

const addUserToDockerGroup = new UserInGroup(targetUser, "docker")
  .withSkipIfAll([
    () => isSuccessful(targetUser, ["docker", "--version"]),
    () => isSuccessful(targetUser, ["docker", "ps"]),
  ])
  .withDependencies([installDocker, startDocker]);

const testDocker = Command
  .custom()
  .withDependencies([
    installDocker,
    addUserToDockerGroup,
    startDocker,
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
    await isDocker()
      ? [installDocker]
      : [installDocker, addUserToDockerGroup, testDocker],
  );
