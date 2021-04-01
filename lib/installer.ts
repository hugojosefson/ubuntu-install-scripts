import { ensureSuccessful, isSuccessful } from "./exec.ts";
import { complement, prop } from "./fn.ts";
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

  console.dir({ pkgInstalleds });
  const packagesToInstall: Array<string> = pkgInstalleds
    .filter(complement(prop("isInstalled")))
    .map(prop("pkg"));
  console.dir({ packagesToInstall });

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
  !!packages.length
    ? ensureSuccessful([
      "sudo",
      "pacman",
      "-Sy",
      "--noconfirm",
      "--needed",
      ...packages,
    ])
    : Promise.resolve();
