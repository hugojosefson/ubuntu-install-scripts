import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readFromUrl } from "../os/read-from-url.ts";
import { targetUser } from "../os/user/target-user.ts";
import { CreateFile } from "./common/file-commands.ts";

export const gitCompletion: Command = Command.custom()
  .withDependencies([
    new CreateFile(
      targetUser,
      FileSystemPath.of(targetUser, "~/.git-completion"),
      await readFromUrl(
        "https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash",
      ),
      false,
    ),
  ]);
