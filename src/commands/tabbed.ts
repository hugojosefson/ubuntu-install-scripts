import { createTempDir } from "../os/create-temp-dir.ts";
import { getTargetUser, ROOT } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

export const tabbed = async () => {
  const targetUser = await getTargetUser();
  const cwd: string = await createTempDir(targetUser);

  return new ParallelCommand([
    addHomeBinToPath,
    new SequentialCommand([
      InstallOsPackage.multi([
        "base-devel",
        "git",
        "libxft",
        "alacritty",
        "coreutils",
        "procps",
        "xdotool",
      ]),
      new Exec(targetUser, {}, [
        "git",
        "clone",
        "https://github.com/hugojosefson/tabbed",
        cwd,
      ]),
      new ParallelCommand([
        new SequentialCommand([
          new Exec(targetUser, { cwd }, [
            "sh",
            "-c",
            "mkdir -p ~/bin",
          ]),
          new Exec(targetUser, { cwd }, [
            "sh",
            "-c",
            "cp extra-tools/* ~/bin/",
          ]),
        ]),
        new SequentialCommand([
          new Exec(targetUser, { cwd }, ["make"]),
          new Exec(ROOT, { cwd }, ["make", "install"]),
        ]),
      ]),
    ]),
  ]);
};
