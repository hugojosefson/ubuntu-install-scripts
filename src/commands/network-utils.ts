import { InstallOsPackage } from "./common/os-package.ts";

export const networkUtils = InstallOsPackage.parallel([
  "corkscrew",
  "mtr",
  "openbsd-netcat",
  "nmap",
  "whois",
]);
