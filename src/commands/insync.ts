import { InstallAurPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const insync = new ParallelCommand([
  InstallAurPackage.parallel(["insync", "insync-nautilus"]),
]);
