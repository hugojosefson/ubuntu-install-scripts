import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { sdkman, sdkmanSourceLine } from "./sdkman.ts";

export const java = InstallOsPackage.of("jdk-openjdk");

export const sdkmanJava = new Exec([sdkman], [], targetUser, {}, [
  "bash",
  "-c",
  `${sdkmanSourceLine} && sdk install java`,
]);
