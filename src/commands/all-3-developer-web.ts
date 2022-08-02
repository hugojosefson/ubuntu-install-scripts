import { Command } from "../model/command.ts";
import { all2DeveloperBase } from "./all-2-developer-base.ts";
import { InstallOsPackage, InstallSnapPackage } from "./common/os-package.ts";
import { eog } from "./eog.ts";
import { networkUtils } from "./network-utils.ts";
import { rust } from "./rust.ts";
import { webstorm } from "./webstorm.ts";
import { deno } from "./deno.ts";
import { node } from "./node.ts";
import { brave } from "./brave.ts";
import { chrome } from "./chrome.ts";

export const all3DeveloperWeb = Command.custom()
  .withDependencies([
    all2DeveloperBase,
    brave,
    chrome,
    deno,
    eog,
    networkUtils,
    node,
    rust,
    webstorm,
    InstallOsPackage.of("firefox"),
    InstallSnapPackage.of("chromium"),
    InstallSnapPackage.ofClassic("code"),
  ]);
