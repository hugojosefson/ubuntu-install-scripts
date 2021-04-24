import { ensureSuccessful } from "./exec.ts";
import { isInsideDocker } from "./is-inside-docker.ts";
import { ensureInstalledOsPackage } from "./os-package-operations.ts";
import { ROOT } from "./user/target-user.ts";

export type FlatpackageName = string;

export const ensureInstalledFlatpak = async (
  flatPackageNames: Array<FlatpackageName>,
): Promise<void> => {
  await ensureInstalledOsPackage("flatpak");
  await ensureSuccessful(ROOT, [
    "flatpak",
    "install",
    "--or-update",
    "--noninteractive",
    ...(isInsideDocker ? ["--no-deploy"] : []),
    "flathub",
    ...flatPackageNames,
  ]);
};
