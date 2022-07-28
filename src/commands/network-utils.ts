import { Command } from "../model/command.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const networkUtils: Command = Command.custom()
  .withDependencies(
    [
      "corkscrew",
      "mtr",
      "netcat-openbsd",
      "nmap",
      "whois",
    ].map(InstallOsPackage.of),
  );
