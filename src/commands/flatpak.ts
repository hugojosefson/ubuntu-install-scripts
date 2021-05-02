import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { flatpakOsPackages } from "../os/os-package-operations.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const flatpak: Command = new class extends AbstractCommand {
  constructor() {
    super(
      "Custom",
      new DependencyId("flatpak", "flatpak"),
    );
    this.dependencies.push(...flatpakOsPackages.map(InstallOsPackage.of));
  }
}();
