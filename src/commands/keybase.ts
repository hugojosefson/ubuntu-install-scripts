import { ROOT, targetUser } from "../os/user/target-user.ts";
import { installOsPackageFromUrl } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { isDocker } from "../deps.ts";

export const installKeybase = new Exec(
  [
    installOsPackageFromUrl(
      "keybase",
      "https://prerelease.keybase.io/keybase_amd64.deb",
    ),
  ],
  [FileSystemPath.of(ROOT, "/etc/apt/trusted.gpg.d/keybase.gpg")],
  ROOT,
  {},
  [
    "bash",
    "-c",
    "apt-key export 656D16C7 | gpg --dearmour --output - | tee /etc/apt/trusted.gpg.d/keybase.gpg >/dev/null",
  ],
);

const runKeybase = new Exec(
  [installKeybase],
  [],
  targetUser,
  {},
  ["run_keybase"],
)
  .withSkipIfAny([await isDocker()]);

export const keybase = Command.custom().withDependencies([
  installKeybase,
  runKeybase,
]);
