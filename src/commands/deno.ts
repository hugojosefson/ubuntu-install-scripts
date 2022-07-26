import { FileSystemPath } from "../model/dependency.ts";
import { isSuccessful } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

const bashRc = FileSystemPath.of(targetUser, "~/.bashrc");

export const deno = new Exec(
  [
    InstallOsPackage.of("curl"),
    InstallOsPackage.of("unzip"),
    new LineInFile(
      targetUser,
      bashRc,
      `export DENO_INSTALL="${targetUser.homedir}/.deno"`,
    ),
    new LineInFile(
      targetUser,
      bashRc,
      'export PATH="$DENO_INSTALL/bin:$PATH"',
    ),
  ],
  [FileSystemPath.of(targetUser, "~/.deno")],
  targetUser,
  {},
  ["sh", "-c", "curl -fsSL https://deno.land/x/install/install.sh | sh"],
)
  .withSkipIfAll([
    () =>
      isSuccessful(targetUser, [
        "bash",
        "-c",
        `. <(grep DENO "${bashRc.path}") && command -v deno`,
      ], {}),
  ]);
