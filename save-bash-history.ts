import ensureLineInFile from "./lib/ensure-line-in-file.ts";

export default () =>
  ensureLineInFile(
    'export PROMPT_COMMAND="history -a $HOME/.bash_history; $PROMPT_COMMAND"',
  )("~/.bashrc");
