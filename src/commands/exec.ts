import { PasswdEntry } from "../deps.ts";
import { Command, CommandResult } from "../model/command.ts";
import { ensureSuccessful, ExecOptions } from "../os/exec.ts";
import { SequentialCommand } from "./common/sequential-command.ts";

export class Exec implements Command {
  readonly type: "Exec" = "Exec";
  private readonly asUser: PasswdEntry;
  private readonly cmd: Array<string>;
  private readonly options?: ExecOptions;

  constructor(
    asUser: PasswdEntry,
    options: ExecOptions = {},
    cmd: Array<string>,
  ) {
    this.asUser = asUser;
    this.cmd = cmd;
    this.options = options;
  }

  static sequential(
    asUser: PasswdEntry,
    options: ExecOptions,
    cmds: Array<Array<string>>,
  ): Command {
    return new SequentialCommand(
      cmds.map((cmd) => new Exec(asUser, options, cmd)),
    );
  }
  toString() {
    return JSON.stringify(this);
  }

  async run(): Promise<CommandResult> {
    return ensureSuccessful(this.asUser, this.cmd, this.options);
  }
}
