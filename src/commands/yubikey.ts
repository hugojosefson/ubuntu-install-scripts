import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const yubikey: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("yubikey", "yubikey"));
    this.dependencies.push(
      ...[
        "yubikey-personalization-gui",
        "yubioath-desktop",
        "yubikey-manager",
        "yubikey-manager-qt",
      ].map(InstallOsPackage.of),
    );
  }
}();
