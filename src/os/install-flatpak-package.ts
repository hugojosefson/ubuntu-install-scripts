import { ensureSuccessful } from "./exec.ts";
import { ensureInstalledOsPackage } from "./install-os-package.ts";
import isInsideDocker from "./is-inside-docker.ts";

export type FlatpackageName = string;

export const ensureInstalledFlatpak = async (
  flatPackageNames: Array<FlatpackageName>,
): Promise<void> => {
  await ensureInstalledOsPackage("flatpak");
  await ensureSuccessful([
    "flatpak",
    "install",
    "--or-update",
    "--noninteractive",
    ...((await isInsideDocker()) ? ["--no-deploy"] : []),
    "flathub",
    ...flatPackageNames,
  ]);
};
