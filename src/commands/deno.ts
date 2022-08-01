import { FileSystemPath } from "../model/dependency.ts";
import { isSuccessful } from "../os/exec.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { readFromUrl } from "../os/read-from-url.ts";
import { Command } from "../model/command.ts";

const downloadDenoToUsrLocalBin = new Exec(
  [
    InstallOsPackage.of("curl"),
    InstallOsPackage.of("unzip"),
  ],
  [FileSystemPath.of(ROOT, "/usr/local/bin/deno")],
  ROOT,
  {
    env: { DENO_INSTALL: "/usr/local" },
    stdin: await readFromUrl("https://deno.land/install.sh"),
  },
  ["sh"],
)
  .withSkipIfAll([
    () => isSuccessful(targetUser, "command -v deno".split(" "), {}),
    () => isSuccessful(ROOT, "command -v deno".split(" "), {}),
  ]);

const setDenoInstallEnv = new LineInFile(
  ROOT,
  FileSystemPath.of(targetUser, "/etc/environment"),
  `DENO_INSTALL=/usr/local`,
);

export const deno = Command.custom().withDependencies([
  setDenoInstallEnv,
  downloadDenoToUsrLocalBin,
]);
