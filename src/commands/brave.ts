import { Exec } from "./exec.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ROOT } from "../os/user/target-user.ts";
import { FileSystemPath, OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { CreateFile } from "./common/file-commands.ts";
import { readFromUrlBytes } from "../os/read-from-url.ts";

const keyringPath = "/usr/share/keyrings/brave-browser-archive-keyring.gpg";
const repoUrl = "https://brave-browser-apt-release.s3.brave.com";

const braveKeyring = new CreateFile(
  ROOT,
  FileSystemPath.of(
    ROOT,
    keyringPath,
  ),
  await readFromUrlBytes(
    `${repoUrl}/brave-browser-archive-keyring.gpg`,
  ),
);

const braveAptSources = new CreateFile(
  ROOT,
  FileSystemPath.of(ROOT, "/etc/apt/sources.list.d/brave-browser-release.list"),
  `deb [signed-by=${keyringPath} arch=amd64] ${repoUrl}/ stable main`,
)
  .withDependencies([InstallOsPackage.of("apt-transport-https")]);

const bravePin = new CreateFile(
  ROOT,
  FileSystemPath.of(ROOT, "/etc/apt/preferences.d/99brave-repository"),
  `# Allow upgrading only brave-browser, brave-keyring from brave repository
Package: brave-browser brave-keyring
Pin: release n=brave
Pin-Priority: 500

# Never prefer other packages from the brave repository
Package: *
Pin: release n=brave
Pin-Priority: 1
`,
);

export const brave = InstallOsPackage.of("brave-browser")
  .withDependencies([
    new Exec(
      [braveKeyring, braveAptSources, bravePin],
      [OS_PACKAGE_SYSTEM],
      ROOT,
      {},
      ["apt", "update"],
    ),
  ]);
