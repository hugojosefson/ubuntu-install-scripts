import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

export const sdkmanSourceLine = ". ~/.sdkman/bin/sdkman-init.sh";

export const sdkman = new SequentialCommand([
  InstallOsPackage.parallel(["unzip", "zip", "curl"]),
  new ParallelCommand([
    new Exec(targetUser, {}, [
      "bash",
      "-c",
      "curl -s https://get.sdkman.io/ | bash",
    ]),
    new LineInFile(
      targetUser,
      "~/.bashrc",
      sdkmanSourceLine,
    ),
  ]),
]);
