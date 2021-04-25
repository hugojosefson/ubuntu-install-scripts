import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";
import { sdkman, sdkmanSourceLine } from "./sdkman.ts";

export const java = new InstallOsPackage("jdk-openjdk");

export const sdkmanJava = new SequentialCommand([
  sdkman,
  new Exec(targetUser, {}, [
    "bash",
    "-c",
    `${sdkmanSourceLine} && sdk install java`,
  ]),
]);
