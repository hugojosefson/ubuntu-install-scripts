import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";

export const saveBashHistory: Command = new LineInFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/.bashrc"),
  'export PROMPT_COMMAND="history -a $HOME/.bash_history; $PROMPT_COMMAND"',
);
