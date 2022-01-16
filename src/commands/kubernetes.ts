import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { docker } from "./docker.ts";

export const minikube = Command
  .custom()
  .withDependencies([
    docker,
    InstallOsPackage.of("minikube"),
  ])
  .withRun(() =>
    ensureSuccessful(targetUser, [
      "minikube",
      "start",
      "--interactive=false",
      "--output=json",
      "--disk-size=20gb",
    ])
  );

export const kubernetes = Command
  .custom()
  .withDependencies([
    minikube,
    InstallOsPackage.of("kubectl"),
  ]);
