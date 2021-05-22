import { Command } from "../model/command.ts";
import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { eog } from "./eog.ts";
import { networkUtils } from "./network-utils.ts";
import { webstorm } from "./webstorm.ts";

export const all3DeveloperWeb = Command.custom()
  .withDependencies([
    all2DeveloperBase,
    eog,
    networkUtils,
    ...[
      "brave",
      "chromium",
      "firefox",
    ].map(InstallOsPackage.of),
    ...[
      "google-chrome",
    ].map(InstallAurPackage.of),
    webstorm,
    addNodeModulesBinToPath,
  ]);
