import { ensureSuccessful, isSuccessful } from "./exec.ts";
import isInsideDocker from "./is-inside-docker.ts";

interface PkgInstalled {
  pkg: string;
  isInstalled: boolean;
}

type InstallQueue = Record<string, Array<Promise<void>>>;

const packageQueue: InstallQueue = {};
const flatpakQueue: InstallQueue = {};

export const ensureInstalled = async (
  packages: Array<string>,
): Promise<void> => {
  const promises: Array<Promise<PkgInstalled>> = packages
    .map(
      async (pkg) => ({ pkg, isInstalled: await isInstalled(pkg) }),
    );

  const pkgInstalleds: Array<PkgInstalled> = await Promise.all(promises);

  const packagesToInstall: Array<string> = pkgInstalleds
    .filter((pkgInstalled) => !pkgInstalled.isInstalled)
    .map((pkgInstalled) => pkgInstalled.pkg);

  return installPackages(packagesToInstall);
};

export const ensureInstalledFlatpak = async (
  flatPackages: Array<string>,
): Promise<void> => {
  await ensureInstalled(["flatpak"]);
  await ensureSuccessful([
    "flatpak",
    "install",
    "--or-update",
    "--noninteractive",
    ...((await isInsideDocker()) ? ["--no-deploy"] : []),
    "flathub",
    ...flatPackages,
  ]);
};

const isInstalled = async (packageName: string): Promise<boolean> =>
  isSuccessful(["pacman", "-Qi", packageName]);

const installPackages = (packages: Array<string> = []): Promise<void> =>
  packages.length
    ? ensureSuccessful([
      "sudo",
      "pacman",
      "-Sy",
      "--noconfirm",
      "--needed",
      ...packages,
    ])
    : Promise.resolve();
