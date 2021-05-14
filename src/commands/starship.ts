import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { vim } from "./vim.ts";

export const starship = Command.custom()
  .withDependencies([
    new Exec([], [], targetUser, {}, [
      "sh",
      "-c",
      "curl -fsSL https://starship.rs/install.sh | sh -s --yes",
    ])
      .withDependencies(
        [
          InstallOsPackage.of("noto-fonts-emoji"),
          InstallOsPackage.of("powerline-fonts"),
          vim,
        ],
      ),
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.config/starship.toml"),
      await readRelativeFile("./files/starship.toml", import.meta.url),
    ),
  ]);
