import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const virtualbox = new ParallelCommand([
  InstallOsPackage.parallel([
    "virtualbox",
    "virtualbox-guest-iso",
  ]),
  new InstallAurPackage("virtualbox-ext-oracle"),
]);
