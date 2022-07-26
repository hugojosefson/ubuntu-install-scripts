import { Command } from "../model/command.ts";
import { InstallBrewPackage, InstallOsPackage } from "./common/os-package.ts";

export const virtualbox: Command = Command
  .custom()
  .withDependencies([
    InstallOsPackage.of("virtualbox"),
    InstallOsPackage.of("virtualbox-guest-iso"),
    InstallBrewPackage.of("virtualbox-ext-oracle"),
  ]);
