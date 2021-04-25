import { InstallAurPackage } from "./common/os-package.ts";

export const minecraft = InstallAurPackage.parallel([
  "multimc5",
  "minecraft-technic-launcher",
]);
