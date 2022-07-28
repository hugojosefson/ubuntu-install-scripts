import { installOsPackageFromUrl } from "./common/os-package.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";

export const mullvad = installOsPackageFromUrl(
  "mullvad-vpn",
  "https://mullvad.net/download/app/deb/latest",
)
  .withSkipIfAny([isInsideDocker]);
