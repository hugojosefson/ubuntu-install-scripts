import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile, LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { vim } from "./vim.ts";
import { InstallRustPackage } from "./rust.ts";

const installStarship = InstallRustPackage.of("starship")
  .withDependencies([
    InstallOsPackage.of("fonts-noto-color-emoji"),
    InstallOsPackage.of("fonts-powerline"),
    vim,
  ]);

const activateStarship = new LineInFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/.bashrc"),
  'eval "$(starship init bash)"',
);

const configureStarship = new CreateFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/.config/starship.toml"),
  await readRelativeFile("./files/starship.toml", import.meta.url),
);

export const starship = Command.custom()
  .withDependencies([
    installStarship,
    activateStarship,
    configureStarship,
  ]);
