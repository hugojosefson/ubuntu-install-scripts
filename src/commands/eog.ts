import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const eog = Command.custom().withDependencies([
  InstallOsPackage.of("eog"),
  InstallOsPackage.of("eog-plugins"),
]);
