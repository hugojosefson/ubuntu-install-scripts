import { InstallRustPackage } from "./rust.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const alacritty = InstallRustPackage
  .of("alacritty")
  .withDependencies(
    "cmake pkg-config libfreetype6-dev libfontconfig1-dev libxcb-xfixes0-dev libxkbcommon-dev python3"
      .split(" ")
      .map(InstallOsPackage.of),
  );
