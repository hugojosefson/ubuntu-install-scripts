import { Command } from "../model/command.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";

export const virtualbox: Command = Command
  .custom()
  .withDependencies([
    InstallOsPackage.of("virtualbox"),
    InstallOsPackage.of("virtualbox-guest-iso"),
    InstallAurPackage.of("virtualbox-ext-oracle"),
  ]);
