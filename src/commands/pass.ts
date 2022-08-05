import { InstallBrewPackage, InstallOsPackage } from "./common/os-package.ts";
import { Symlink } from "./common/file-commands.ts";
import { ROOT } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";

export const pass = new Symlink(
  ROOT,
  "/usr/share/doc/pass/examples/dmenu/passmenu",
  FileSystemPath.of(ROOT, "/usr/local/bin/passmenu"),
).withDependencies([
  InstallOsPackage.of("pass"),
  InstallBrewPackage.of("dmenu"),
]);
