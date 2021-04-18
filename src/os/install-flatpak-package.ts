import { ensureSuccessful } from "./exec.ts";
import isInsideDocker from "./is-inside-docker.ts";
import { ensureInstalledOsPackage } from "./os-package-operations.ts";

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
