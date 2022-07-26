import { config } from "../config.ts";
import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallBrewPackage, InstallOsPackage } from "./common/os-package.ts";

const androidRemoteScreen = new CreateFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/bin/android-remote-screen"),
  `#!/bin/sh\nadb connect ${config.ANDROID_HOSTNAME} && scrcpy --prefer-text`,
  false,
  MODE_EXECUTABLE_775,
);

export const android = Command.custom().withDependencies([
  androidRemoteScreen
    .withDependencies([
      addHomeBinToPath,
      InstallBrewPackage.of("scrcpy")
        .withDependencies([InstallOsPackage.of("android-tools")]),
    ]),
]);
