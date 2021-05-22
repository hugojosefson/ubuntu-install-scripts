import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const xorg = Command.custom().withDependencies([
  InstallOsPackage.of("xorg"),
  InstallOsPackage.of("xorg-server"),
]);
