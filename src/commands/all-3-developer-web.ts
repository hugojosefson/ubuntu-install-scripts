import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { networkUtils } from "./network-utils.ts";
import { webstorm } from "./webstorm.ts";

export const all3DeveloperWeb = new ParallelCommand([
  all2DeveloperBase,
  networkUtils,
  InstallOsPackage.parallel([
    "brave",
    "chromium",
  ]),
  InstallAurPackage.parallel([
    "google-chrome",
  ]),
  webstorm,
  addNodeModulesBinToPath,
]);
