import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";

export const saveBashHistory: Command = new LineInFile(
  targetUser,
  FileSystemPath.of(targetUser, "~/.bashrc"),
  '[[ "${PROMPT_COMMAND}" == *"history -a $HOME/.bash_history"* ]] || export PROMPT_COMMAND="${PROMPT_COMMAND:-:}; history -a $HOME/.bash_history"',
);
