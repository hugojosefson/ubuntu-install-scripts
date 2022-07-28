import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage, isInstalledOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { Command } from "../model/command.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";

export const installKeybase = new Exec(
  [
    "curl",
    "gdebi-core",
  ].map(InstallOsPackage.of),
  [OS_PACKAGE_SYSTEM],
  ROOT,
  {},
  [
    "bash",
    "-c",
    `
set -euo pipefail
IFS=$'\n\t'

tmp_file="$(mktemp --suffix=.deb)"
trap 'rm -f "$tmp_file"' EXIT
curl -sLf https://prerelease.keybase.io/keybase_amd64.deb -o "$tmp_file"
gdebi --non-interactive "$tmp_file"
  `,
  ],
)
  .withSkipIfAll([
    () => isInstalledOsPackage("keybase"),
  ]);

const runKeybase = new Exec(
  [installKeybase],
  [],
  targetUser,
  {},
  ["run_keybase"],
)
  .withSkipIfAll([isInsideDocker]);

export const keybase = Command.custom().withDependencies([
  installKeybase,
  runKeybase,
]);
