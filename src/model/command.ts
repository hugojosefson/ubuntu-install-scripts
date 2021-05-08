import { NOOP } from "../commands/common/noop.ts";
import { colorlog } from "../deps.ts";
import { defer, Deferred } from "../os/defer.ts";
import { DependencyId, Lock, ReleaseLockFn } from "./dependency.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}

export type CommandType =
  | "RefreshOsPackages"
  | "InstallOsPackage"
  | "RemoveOsPackage"
  | "ReplaceOsPackage"
  | "UpgradeOsPackages"
  | "InstallAurPackage"
  | "RemoveAurPackage"
  | "InstallFlatpakPackage"
  | "RemoveFlatpakPackage"
  | "Symlink"
  | "CreateFile"
  | "CreateDir"
  | "LineInFile"
  | "UserInGroup"
  | "Exec"
  | "Custom"
  | "Noop";

export class Command {
  readonly type: CommandType;
  readonly id: DependencyId;
  readonly dependencies: Array<Command> = new Array(0);
  readonly locks: Array<Lock> = new Array(0);
  readonly doneDeferred: Deferred<CommandResult> = defer();
  readonly done: Promise<CommandResult> = this.doneDeferred.promise;

  protected constructor(commandType: CommandType, id: DependencyId) {
    this.type = commandType;
    this.id = id;
  }

  toString() {
    return JSON.stringify(this);
  }
  async runWhenDependenciesAreDone(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    console.log(colorlog.warning(
      `Command.runWhenDependenciesAreDone: waiting for ${
        [...this.dependencies].length
      } dependencies...       ${this.type} ${this.id}`,
    ));
    console.log(
      colorlog.warning(
        `Command.runWhenDependenciesAreDone: waiting for this.dependencies:        ${this.type} ${this.id}`,
      ),
      this.dependencies,
    );
    if ([...this.dependencies].length) {
      await Promise.all(this.dependencies.map(({ done }) => done));
    }
    console.log(colorlog.warning(
      `Command.runWhenDependenciesAreDone: waiting for ${
        [...this.dependencies].length
      } dependencies... DONE. ${this.type} ${this.id}`,
    ));
    console.log(colorlog.warning(
      `Command.runWhenDependenciesAreDone: waiting for ${
        [...this.locks].length
      } locks...              ${this.type} ${this.id}`,
    ));
    const releaseLockFns: Array<ReleaseLockFn> = await Promise.all(
      this.locks.map((lock) => lock.take()),
    );
    console.log(colorlog.warning(
      `Command.runWhenDependenciesAreDone: waiting for ${
        [...this.locks].length
      } locks... DONE.        ${this.type} ${this.id}`,
    ));
    try {
      const innerResult: RunResult = await (this.run().catch(
        this.doneDeferred.reject,
      ));
      return this.resolve(innerResult);
    } finally {
      releaseLockFns.forEach((releaseLock) => releaseLock());
    }
  }

  static of(commandType: CommandType, id: DependencyId): Command {
    return new Command(commandType, id);
  }

  static custom(id: DependencyId | string): Command {
    return Command.of(
      "Custom",
      typeof id === "string" ? new DependencyId(id) : id,
    );
  }

  async run(): Promise<RunResult> {
  }

  resolve(
    commandResult: RunResult,
  ): Promise<CommandResult> {
    if (!commandResult) {
      this.doneDeferred.resolve({
        status: { success: true, code: 0 },
        stdout: `Success: ${this.id.toString()}`,
        stderr: "",
      });
      return this.done;
    }
    if (typeof commandResult === "string") {
      this.doneDeferred.resolve({
        status: { success: true, code: 0 },
        stdout: commandResult,
        stderr: "",
      });
      return this.done;
    }

    this.doneDeferred.resolve(commandResult);
    return this.done;
  }

  static sequential(commands: Array<Command>): Command {
    if (commands.length === 0) {
      return NOOP();
    }
    if (commands.length === 1) {
      return commands[0];
    }
    const head = commands[0];
    const tail = commands.slice(1);
    return Command
      .of("Custom", head.id.clone())
      .withDependencies([...tail, ...head.dependencies])
      .withLocks(head.locks)
      .withRun(head.run);
  }

  withDependencies(dependencies: Array<Command>): Command {
    if (this.dependencies.length === 0) {
      this.dependencies.push(...dependencies);
      return this;
    }
    return Command.sequential([
      Command.custom("withDependencies").withDependencies(dependencies),
      this,
    ]);
  }

  withLocks(locks: Array<Lock>): Command {
    this.locks.push(...locks);
    return this;
  }

  withRun(run: RunFunction): Command {
    this.run = run;
    return this;
  }
}

export type RunResult = CommandResult | void | string;
export type RunFunction = () => Promise<RunResult>;
