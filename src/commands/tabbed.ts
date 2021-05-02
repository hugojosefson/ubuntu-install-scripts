import { FileSystemPath } from "../model/dependency.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const tabbed = async () => {
  const tempDir: FileSystemPath = await createTempDir(targetUser);
  const cwd = tempDir.path;

  return new ParallelCommand([
    addHomeBinToPath,
    new SequentialCommand([
      InstallOsPackage.parallel([
        "base-devel",
        "git",
        "libxft",
        "alacritty",
        "coreutils",
        "procps",
        "xdotool",
      ]),
      new Exec([], [tempDir], targetUser, { cwd }, [
        "git",
        "clone",
        "https://github.com/hugojosefson/tabbed",
      ]),
      new ParallelCommand([
        new SequentialCommand([
          new Exec([], [tempDir], targetUser, { cwd }, [
            "sh",
            "-c",
            "mkdir -p ~/bin",
          ]),
          new Exec([], [tempDir], targetUser, { cwd }, [
            "sh",
            "-c",
            "cp extra-tools/* ~/bin/",
          ]),
        ]),
        new SequentialCommand([
          new Exec([], [tempDir], targetUser, { cwd }, ["make"]),
          new Exec([], [tempDir], ROOT, { cwd }, ["make", "install"]),
        ]),
      ]),
    ]),
  ]);
};
