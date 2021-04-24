import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { networkUtils } from "./network-utils.ts";
import { webstorm } from "./webstorm.ts";

export const all3DeveloperWeb = new SequentialCommand([
  all2DeveloperBase,
  new ParallelCommand([
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
  ]),
]);
