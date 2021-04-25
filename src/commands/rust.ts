import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { SequentialCommand } from "./common/sequential-command.ts";
import { Exec } from "./exec.ts";

export const rust = new ParallelCommand([
  new SequentialCommand([
    InstallOsPackage.parallel(["base-devel", "rustup"]),
    Exec.sequential(targetUser, {}, [
      ["rustup", "toolchain", "install", "stable"],
      ["cargo", "install", "bat", "exa", "fd-find", "ripgrep"],
    ]),
  ]),
  new LineInFile(targetUser, "~/.bashrc", 'export PATH="~/.cargo/bin:$PATH"'),
]);
