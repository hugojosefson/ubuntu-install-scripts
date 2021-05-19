import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const deno = new Exec(
  [
    InstallOsPackage.of("curl"),
    InstallOsPackage.of("unzip"),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      `export DENO_INSTALL="${targetUser.homedir}/.deno"`,
    ),
    new LineInFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.bashrc"),
      'export PATH="$DENO_INSTALL/bin:$PATH"',
    ),
  ],
  [FileSystemPath.of(targetUser, "~/.deno")],
  targetUser,
  {},
  ["sh", "-c", "curl -fsSL https://deno.land/x/install/install.sh | sh"],
);
