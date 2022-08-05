import { ROOT } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { FileSystemPath, OS_PACKAGE_SYSTEM } from "../model/dependency.ts";
import { CreateFile } from "./common/file-commands.ts";
import { readFromUrlBytes } from "../os/read-from-url.ts";

export const signalDesktop = InstallOsPackage.of("signal-desktop")
  .withDependencies([
    new Exec(
      [
        new CreateFile(
          ROOT,
          FileSystemPath.of(ROOT, "/etc/apt/sources.list.d/signal-xenial.list"),
          "deb [arch=amd64 signed-by=/usr/share/keyrings/signal-desktop-keyring.gpg] https://updates.signal.org/desktop/apt xenial main",
        ),
        new CreateFile(
          ROOT,
          FileSystemPath.of(
            ROOT,
            "/etc/apt/preferences.d/99signal-desktop-repository",
          ),
          `
# Allow upgrading only signal-desktop from signal-desktop repository
Package: signal-desktop
Pin: release n=signal-desktop
Pin-Priority: 500

# Never prefer other packages from the signal-desktop repository
Package: *
Pin: release n=signal-desktop
Pin-Priority: 1

`.trim(),
        ),

        new Exec(
          [],
          [FileSystemPath.of(
            ROOT,
            "/usr/share/keyrings/signal-desktop-keyring.gpg",
          )],
          ROOT,
          {
            stdin: await readFromUrlBytes(
              "https://updates.signal.org/desktop/apt/keys.asc",
            ),
          },
          [
            "bash",
            "-c",
            "gpg --dearmor > /usr/share/keyrings/signal-desktop-keyring.gpg",
          ],
        ),
      ],
      [OS_PACKAGE_SYSTEM],
      ROOT,
      {},
      ["apt", "update"],
    ),
  ]);
