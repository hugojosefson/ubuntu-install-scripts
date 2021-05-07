import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const networkUtils: Command = Command.custom("networkUtils")
  .withDependencies(
    [
      "corkscrew",
      "mtr",
      "openbsd-netcat",
      "nmap",
      "whois",
    ].map(InstallOsPackage.of),
  );
