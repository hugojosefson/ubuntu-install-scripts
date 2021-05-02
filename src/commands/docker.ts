import { AbstractCommand, CommandResult } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { UserInGroup } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

const addUserToDockerGroup = new class extends AbstractCommand {
  constructor() {
    super(
      "Custom",
      new DependencyId("addUserToDockerGroup", "addUserToDockerGroup"),
    );
    this.dependencies.push(InstallOsPackage.of("docker"));
    this.dependencies.push(new UserInGroup(targetUser, "docker"));
  }
}();

const installDocker = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("installDocker", "installDocker"));
    this.dependencies.push(InstallOsPackage.of("docker"));
    this.dependencies.push(InstallOsPackage.of("docker-compose"));
    this.dependencies.push(addUserToDockerGroup);
  }
}();

export const docker = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("docker", "docker"));
    this.dependencies.push(installDocker);
    if (!isInsideDocker) {
      this.dependencies.push(activateDocker);
      this.dependencies.push(testDocker);
    }
  }
}();

const activateDocker = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("activateDocker", "activateDocker"));
  }
  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }
    await ensureSuccessful(ROOT, ["systemctl", "enable", "docker.service"]);
    await ensureSuccessful(ROOT, ["systemctl", "start", "docker.service"]);
    await ensureSuccessful(ROOT, ["docker", "version"]);
    return this.resolve();
  }
}();

const testDocker = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("testDocker", "testDocker"));
    this.dependencies.push(activateDocker);
    this.dependencies.push(addUserToDockerGroup);
  }
  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }
    return this.resolve(
      await ensureSuccessful(targetUser, [
        "docker",
        "run",
        "--rm",
        "hello-world",
      ]),
    );
  }
}();
