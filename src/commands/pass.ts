import { InstallBrewPackage, InstallOsPackage } from "./common/os-package.ts";
import { Symlink } from "./common/file-commands.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { Exec } from "./exec.ts";
import { readFromUrl } from "../os/read-from-url.ts";

export const pass = new Symlink(
  ROOT,
  "/usr/share/doc/pass/examples/dmenu/passmenu",
  FileSystemPath.of(ROOT, "/usr/local/bin/passmenu"),
).withDependencies([
  InstallOsPackage.of("pass"),
  InstallOsPackage.of("pass-extension-otp"),
  InstallBrewPackage.of("dmenu"),
  new Exec(
    [],
    [],
    targetUser,
    {
      stdin: await readFromUrl(
        "https://github.com/passff/passff-host/releases/latest/download/install_host_app.sh",
      ),
    },
    ["bash", "-s", "--", "firefox"],
  ),
]);
