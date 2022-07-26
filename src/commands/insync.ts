import { Command } from "../model/command.ts";
import { InstallBrewPackage } from "./common/os-package.ts";

export const insync: Command = Command.custom()
  .withDependencies(
    ["insync", "insync-nautilus"].map(InstallBrewPackage.of),
  );
