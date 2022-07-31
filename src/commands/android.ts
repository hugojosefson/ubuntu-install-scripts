import { config } from "../config.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { CreateFile, MODE_EXECUTABLE_775 } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const android = new CreateFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/bin/android-remote-screen"),
  `#!/usr/bin/env bash

set -euo pipefail
IFS=$'\\t\\n'

adb connect ${config.ANDROID_HOSTNAME}:\${1:-5555}
scrcpy --prefer-text
`,
  false,
  MODE_EXECUTABLE_775,
)
  .withDependencies([
    addHomeBinToPath,
    InstallOsPackage.of("scrcpy")
      .withDependencies([InstallOsPackage.of("android-sdk")]),
  ]);
