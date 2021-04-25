import { InstallOsPackage } from "./common/os-package.ts";
import { flatpakOsPackages } from "../os/os-package-operations.ts";

export const flatpak = InstallOsPackage.parallel(flatpakOsPackages);
