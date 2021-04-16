import { ensureInstalled } from "./lib/install-flatpak-package.ts";

ensureInstalled([
  "yubikey-personalization-gui",
  "yubioath-desktop",
  "yubikey-manager",
]);
