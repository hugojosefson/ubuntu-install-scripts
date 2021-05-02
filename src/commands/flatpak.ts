import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const flatpakOsPackages = ["xdg-desktop-portal-gtk", "flatpak"];

export const flatpak: Command = new class extends AbstractCommand {
  constructor() {
    super(
      "Custom",
      new DependencyId("flatpak", "flatpak"),
    );
    this.dependencies.push(...flatpakOsPackages.map(InstallOsPackage.of));
  }
}();
