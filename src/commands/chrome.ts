import { installOsPackageFromUrl } from "./common/os-package.ts";

export const chrome = installOsPackageFromUrl(
  "google-chrome-stable",
  "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb",
);
