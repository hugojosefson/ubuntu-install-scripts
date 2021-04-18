import { Command } from "../model/command.ts";
import { getTargetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";

export const saveBashHistory: Command = new LineInFile(
  await getTargetUser(),
  "~/.bashrc",
  'export PROMPT_COMMAND="history -a $HOME/.bash_history; $PROMPT_COMMAND"',
);
