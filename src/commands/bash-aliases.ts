import { readRelativeFile } from "../os/read-relative-file.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile, LineInFile } from "./common/file-commands.ts";
import { ParallelCommand } from "./common/parallel-command.ts";

export const bashAliases = new ParallelCommand([
  new LineInFile(targetUser, "~/.bashrc", ". ~/.bash_aliases"),
  new CreateFile(
    targetUser,
    "~/.bash_aliases",
    await readRelativeFile("./files/.bash_aliases", import.meta.url),
    true,
  ),
]);
