import { NOOP } from "../commands/common/noop.ts";
import { config } from "../config.ts";
import { colorlog } from "../deps.ts";
import { defer, Deferred } from "../os/defer.ts";
import { Lock, LockReleaser } from "./dependency.ts";

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
  readonly dependencies: Array<Command> = new Array(0);
  readonly locks: Array<Lock> = new Array(0);
  readonly doneDeferred: Deferred<CommandResult> = defer();
  readonly done: Promise<CommandResult> = this.doneDeferred.promise;

  protected constructor(commandType: CommandType) {
    this.type = commandType;
  }

  toString() {
    return JSON.stringify(this);
  }
  async runWhenDependenciesAreDone(): Promise<CommandResult> {
    config.verbose && console.log(`Running command `, this);
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    const dependenciesDone = this.dependencies.map(({ done }) => done);
    const lockReleaserPromises = this.locks.map((lock) => lock.take());
    await Promise.all(dependenciesDone);

    const lockReleasers = await Promise.all(lockReleaserPromises);
    try {
      const innerResult: RunResult = await (this.run().catch(
        this.doneDeferred.reject,
      ));
      config.verbose && console.log(`Running command `, this, "DONE.");
      return this.resolve(innerResult);
    } finally {
      lockReleasers.forEach((releaseLock) => releaseLock());
    }
  }

  static of(commandType: CommandType): Command {
    return new Command(commandType);
  }

  static custom(): Command {
    return Command.of("Custom");
  }

  async run(): Promise<RunResult> {
  }

  resolve(
    commandResult: RunResult,
  ): Promise<CommandResult> {
    if (!commandResult) {
      this.doneDeferred.resolve({
        status: { success: true, code: 0 },
        stdout: `Success: ${this.type}`,
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
      .of("Custom")
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
      Command.custom().withDependencies(dependencies),
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
