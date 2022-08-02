import { installOsPackageFromUrl } from "./common/os-package.ts";

export const minecraft = installOsPackageFromUrl(
  "minecraft-launcher",
  "https://launcher.mojang.com/download/Minecraft.deb",
);
