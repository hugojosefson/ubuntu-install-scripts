import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";

export const virtualbox: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("virtualbox", "virtualbox"));
    this.dependencies.push(
      InstallOsPackage.of("virtualbox"),
      InstallOsPackage.of("virtualbox-guest-iso"),
      InstallAurPackage.of("virtualbox-ext-oracle"),
    );
  }
}();
