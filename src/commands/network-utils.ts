import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const networkUtils: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("networkUtils", "networkUtils"));
    this.dependencies.push(
      ...[
        "corkscrew",
        "mtr",
        "openbsd-netcat",
        "nmap",
        "whois",
      ].map(InstallOsPackage.of),
    );
  }
}();
