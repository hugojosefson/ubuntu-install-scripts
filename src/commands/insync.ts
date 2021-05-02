import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { InstallAurPackage } from "./common/os-package.ts";

export const insync: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("insync", "insync"));
    this.dependencies.push(
      ...["insync", "insync-nautilus"].map(InstallAurPackage.of),
    );
  }
}();
