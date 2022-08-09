import { Symlink } from "./common/file-commands.ts";
import { ROOT } from "../os/user/target-user.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { InstallBrewPackage } from "./common/os-package.ts";

export const dmenu = new Symlink(
  ROOT,
  "/home/linuxbrew/.linuxbrew/bin/dmenu",
  FileSystemPath.of(ROOT, "/usr/local/bin/dmenu"),
)
  .withDependencies([
    InstallBrewPackage.of("dmenu"),
  ]);
