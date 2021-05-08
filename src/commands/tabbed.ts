import { colorlog } from "../deps.ts";
import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { addHomeBinToPath } from "./add-home-bin-to-path.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

export const tabbed = async () => {
  const fileSystemPathPromise = createTempDir(targetUser);
  console.error(
    colorlog.error(
      `tabbed: fileSystemPathPromise:`,
    ),
    fileSystemPathPromise,
  );
  fileSystemPathPromise.then(
    (tempD) => {
      console.log(
        colorlog.success(`tabbed: tempD: ${JSON.stringify(tempD)}`),
        tempD,
      );
    },
    (reason) => {
      console.error(
        colorlog.error(`tabbed: error: `),
        reason,
      );
    },
  );
  const tempDir: FileSystemPath = await fileSystemPathPromise;
  console.error(colorlog.error(`tabbed: tempDir: ${JSON.stringify(tempDir)}`));
  // return Command.custom("tabbed").withLocks([tempDir]);
  const cwd: string = tempDir.path;

  const gitClone = new Exec(
    [InstallOsPackage.of("git")],
    [tempDir],
    targetUser,
    { cwd },
    [
      "git",
      "clone",
      "https://github.com/hugojosefson/tabbed",
      cwd,
    ],
  );

  const makeDeps = [
    "base-devel",
    "libxft",
    "alacritty",
    "coreutils",
    "procps",
    "xdotool",
  ].map(InstallOsPackage.of);

  const make = new Exec(
    [gitClone, ...makeDeps],
    [tempDir],
    targetUser,
    { cwd },
    ["make"],
  );

  const copyExtraTools = new Exec(
    [make, addHomeBinToPath],
    [tempDir],
    targetUser,
    { cwd },
    ["sh", "-c", "cp extra-tools/* ~/bin/"],
  );
  const makeInstall = new Exec(
    [make],
    [tempDir],
    ROOT,
    { cwd },
    ["make", "install"],
  );

  return Command.custom("tabbed")
    .withDependencies([
      copyExtraTools,
      makeInstall,
    ]);
};
