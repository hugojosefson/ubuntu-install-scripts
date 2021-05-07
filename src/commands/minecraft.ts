import { Command } from "../model/command.ts";
import { InstallAurPackage } from "./common/os-package.ts";

export const minecraft: Command = Command.custom("minecraft")
  .withDependencies(
    ["multimc5", "minecraft-technic-launcher"].map(InstallAurPackage.of),
  );
