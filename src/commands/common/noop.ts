import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Dependency, DependencyId, Lock } from "../../model/dependency.ts";
import { defer, Deferred } from "../../os/defer.ts";

export class Noop implements Command {
  readonly type: CommandType = "Noop";
  readonly id: DependencyId = new DependencyId("Noop", "NOOP");
  readonly dependencies: Array<Dependency> = [];
  readonly locks: Array<Lock> = [];
  private readonly doneDeferred: Deferred<CommandResult> = defer<
    CommandResult
  >();
  readonly done: Promise<CommandResult> = this.doneDeferred.promise;

  run(): Promise<CommandResult> {
    this.doneDeferred.resolve({
      stdout: "",
      stderr: "",
      status: { success: true, code: 0 },
    });
    return this.done;
  }

  toString() {
    return "Noop";
  }
}

export const NOOP = new Noop();
