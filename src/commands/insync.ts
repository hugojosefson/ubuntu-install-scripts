import { Command } from "../model/command.ts";
import { InstallAurPackage } from "./common/os-package.ts";

export const insync: Command = Command.custom()
  .withDependencies(
    ["insync", "insync-nautilus"].map(InstallAurPackage.of),
  );
