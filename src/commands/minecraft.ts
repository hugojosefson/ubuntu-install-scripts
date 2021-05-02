import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { InstallAurPackage } from "./common/os-package.ts";

export const minecraft: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("minecraft", "minecraft"));
    this.dependencies.push(
      InstallAurPackage.of("multimc5"),
      InstallAurPackage.of("minecraft-technic-launcher"),
    );
  }
}();
