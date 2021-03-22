import { complement, prop } from "./fn.ts";
import installPackages from "./install-packages.ts";
import isInstalled from "./is-installed.ts";

interface PkgInstalled {
  pkg: string;
  isInstalled: boolean;
}

export default async (...packages: Array<string>): Promise<void> => {
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
