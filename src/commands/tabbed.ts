import { config } from "../config.ts";
import { colorlog } from "../deps.ts";
import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { git } from "./git.ts";
import { xorg } from "./xorg.ts";

export const tabbed = async () => {
  const fileSystemPathPromise = createTempDir(targetUser);
  config.VERBOSE && console.error(
    colorlog.error(
      `tabbed: fileSystemPathPromise:`,
    ),
    fileSystemPathPromise,
  );
  fileSystemPathPromise.then(
    (tempD) => {
      config.VERBOSE && console.error(
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
  config.VERBOSE &&
    console.error(
      colorlog.error(`tabbed: tempDir: ${JSON.stringify(tempDir)}`),
    );
  // return Command.custom().withLocks([tempDir]);
  const cwd: string = tempDir.path;

  const gitClone = new Exec(
    [git],
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
    [make],
    [tempDir],
    ROOT,
    { cwd },
    ["sh", "-c", "cp extra-tools/* /usr/local/bin/"],
  );
  const makeInstall = new Exec(
    [make],
    [tempDir],
    ROOT,
    { cwd },
    ["make", "install"],
  );

  return Command.custom()
    .withDependencies([
      copyExtraTools,
      makeInstall,
      xorg,
    ]);
};
