import { PasswdEntry } from "../deps.ts";
import { AbstractCommand, CommandResult } from "../model/command.ts";
import { Dependency, DependencyId, Lock } from "../model/dependency.ts";
import { ensureSuccessful, ExecOptions } from "../os/exec.ts";

export class Exec extends AbstractCommand {
  private readonly asUser: PasswdEntry;
  private readonly cmd: Array<string>;
  private readonly options?: ExecOptions;

  constructor(
    dependencies: Array<Dependency>,
    locks: Array<Lock>,
    asUser: PasswdEntry,
    options: ExecOptions = {},
    cmd: Array<string>,
  ) {
    super("Exec", new DependencyId("Exec", { asUser, cmd, options }));
    this.asUser = asUser;
    this.cmd = cmd;
    this.options = options;
  }

  async run(): Promise<CommandResult> {
    ensureSuccessful(
      this.asUser,
      this.cmd,
      this.options,
    ).then(this.doneDeferred.resolve, this.doneDeferred.reject);

    return this.done;
  }
}
