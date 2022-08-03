import { installOsPackageFromUrl } from "./common/os-package.ts";
import { isInsideDocker } from "../deps.ts";

export const mullvad = installOsPackageFromUrl(
  "mullvad-vpn",
  "https://mullvad.net/download/app/deb/latest",
)
  .withSkipIfAny([isInsideDocker]);
