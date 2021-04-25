import { InstallOsPackage } from "./common/os-package.ts";

export const yubikey = InstallOsPackage.parallel([
  "yubikey-personalization-gui",
  "yubioath-desktop",
  "yubikey-manager",
  "yubikey-manager-qt",
]);
