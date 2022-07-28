import { targetUser } from "../os/user/target-user.ts";
import { installOsPackageFromUrl } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { Command } from "../model/command.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";

export const installKeybase = installOsPackageFromUrl(
  "keybase",
  "https://prerelease.keybase.io/keybase_amd64.deb",
);

const runKeybase = new Exec(
  [installKeybase],
  [],
  targetUser,
  {},
  ["run_keybase"],
)
  .withSkipIfAny([isInsideDocker]);

export const keybase = Command.custom().withDependencies([
  installKeybase,
  runKeybase,
]);
