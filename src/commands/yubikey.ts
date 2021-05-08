import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const yubikey: Command = Command
  .custom()
  .withDependencies([
    "yubikey-personalization-gui",
    "yubioath-desktop",
    "yubikey-manager",
    "yubikey-manager-qt",
  ].map(InstallOsPackage.of));
