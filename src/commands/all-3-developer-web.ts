import { Command } from "../model/command.ts";
import { addNodeModulesBinToPath } from "./add-node_modules-bin-to-path.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { InstallFlatpakPackage } from "./common/os-package.ts";
import { eog } from "./eog.ts";
import { networkUtils } from "./network-utils.ts";
import { rust } from "./rust.ts";
import { webstorm } from "./webstorm.ts";
import { deno } from "./deno.ts";
import { node } from "./node.ts";

export const all3DeveloperWeb = Command.custom()
  .withDependencies([
    all2DeveloperBase,
    deno,
    eog,
    networkUtils,
    node,
    rust,
    webstorm,
    addNodeModulesBinToPath,
    ...[
      "org.chromium.Chromium",
      "org.mozilla.firefox",
      "com.brave.Browser",
      "com.google.Chrome",
    ].map(InstallFlatpakPackage.of),
  ]);
