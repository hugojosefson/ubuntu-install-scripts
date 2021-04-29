import { PasswdEntry } from "../deps.ts";
import { Command, CommandResult } from "../model/command.ts";
import { Dependency, DependencyId, Lock } from "../model/dependency.ts";
import { defer, Deferred } from "../os/defer.ts";
import { ensureSuccessful, ExecOptions } from "../os/exec.ts";

export class Exec implements Command {
  readonly type: "Exec" = "Exec";
  readonly id: DependencyId;
  readonly dependencies: Array<Dependency>;
  private readonly doneDeferred: Deferred<CommandResult> = defer<
    CommandResult
  >();
  readonly done: Promise<CommandResult> = this.doneDeferred.promise;
  readonly locks: Array<Lock>;
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
    this.id = new DependencyId("Exec", { asUser, cmd, options });
    this.dependencies = dependencies;
    this.locks = locks;
    this.asUser = asUser;
    this.cmd = cmd;
    this.options = options;
  }

  toString() {
    return JSON.stringify(this);
  }

  async run(): Promise<CommandResult> {
    const resultPromise = ensureSuccessful(
      this.asUser,
      this.cmd,
      this.options,
    );
    resultPromise.then(this.doneDeferred.resolve, this.doneDeferred.reject);
    return resultPromise;
  }
}
