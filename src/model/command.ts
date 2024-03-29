import { NOOP } from "../commands/common/noop.ts";
import { config } from "../config.ts";
import { Ish, resolveValue } from "../fn.ts";
import { defer, Deferred } from "../os/defer.ts";
import { run } from "../run.ts";
import { Lock } from "./dependency.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}

export class Command {
  readonly dependencies: Array<Command> = new Array(0);
  readonly locks: Array<Lock> = new Array(0);
  readonly skipIfAll: Array<Predicate> = new Array(0);
  readonly skipIfAny: Array<Predicate> = new Array(0);
  readonly doneDeferred: Deferred<CommandResult> = defer();
  readonly done: Promise<CommandResult> = this.doneDeferred.promise;

  toString(): string {
    return this.constructor.name;
  }

  async runWhenDependenciesAreDone(): Promise<CommandResult> {
    config.VERBOSE && console.error(`Running command `, this);
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
      config.VERBOSE && console.error(`Running command `, this, "DONE.");
      return this.resolve(innerResult);
    } finally {
      lockReleasers.forEach((releaseLock) => releaseLock());
    }
  }

  static custom(): Command {
    return (new Command());
  }

  async run(): Promise<RunResult> {
  }

  resolve(
    commandResult: RunResult,
  ): Promise<CommandResult> {
    if (!commandResult) {
      this.doneDeferred.resolve({
        status: { success: true, code: 0 },
        stdout: `Success: ${this}`,
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
    if (Array.isArray(commandResult)) {
      const postCommands: Command[] = commandResult;
      return run(postCommands).then((postCommandResults: CommandResult[]) =>
        this.resolve(postCommandResults[postCommandResults.length])
      );
    }

    this.doneDeferred.resolve(commandResult);
    return this.done;
  }

  /**
   * Chains commands to make sure they are run one at a time, in the order given.
   * @param commands The commands to run in order.
   */
  static sequential(commands: Command[]): Command {
    if (commands.length === 0) {
      return NOOP();
    }
    if (commands.length === 1) {
      return commands[0];
    }
    return commands.reduce(
      (acc, curr) => {
        curr.dependencies.push(acc);
        return curr;
      },
      Command.custom(),
    );
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

  withSkipIfAll(predicates: Array<Predicate>): Command {
    this.skipIfAll.push(...predicates);
    return this;
  }

  withSkipIfAny(predicates: Array<Predicate>): Command {
    this.skipIfAny.push(...predicates);
    return this;
  }

  private _shouldSkip: boolean | undefined = undefined;

  async shouldSkip(): Promise<boolean> {
    if (this._shouldSkip === true) {
      if (!this.doneDeferred.isDone) {
        this.doneDeferred.resolve(this.alreadyDoneResult());
      }
      return true;
    }

    if (this._shouldSkip === false) {
      return false;
    }

    try {
      if (this.skipIfAny.length > 0) {
        const skipIfAnyValuePromises: Promise<boolean>[] = this.skipIfAny.map((
          predicate,
        ) => resolveValue(predicate));
        const skipIfAnyValues: boolean[] = await Promise.all(
          skipIfAnyValuePromises,
        );
        const skipIfAnyResult: boolean = skipIfAnyValues.some(Boolean);
        if (skipIfAnyResult) {
          console.log("Skipping because of skipIfAny", skipIfAnyValues);
          this._shouldSkip = true;
          if (!this.doneDeferred.isDone) {
            this.doneDeferred.resolve(this.alreadyDoneResult());
          }
          return true;
        }
      }
      if (this.skipIfAll.length > 0) {
        const skipIfAllValuePromises: Promise<boolean>[] = this.skipIfAll.map(
          (predicate) => resolveValue(predicate),
        );
        const skipIfAllValues: boolean[] = await Promise.all(
          skipIfAllValuePromises,
        );
        const skipIfAllResult: boolean = skipIfAllValues.every(Boolean);
        if (skipIfAllResult) {
          console.log("Skipping because of skipIfAll", skipIfAllValues);
          this._shouldSkip = true;
          if (!this.doneDeferred.isDone) {
            this.doneDeferred.resolve(this.alreadyDoneResult());
          }
          return true;
        }
      }
    } catch (e) {
      console.warn(`Some predicate failed, so we should run the command.`, e);
    }
    this._shouldSkip = false;
    return false;
  }

  private alreadyDoneResult(): CommandResult {
    return {
      status: { success: true, code: 0 },
      stdout: `Already done: ${this.toString()}`,
      stderr: "",
    };
  }
}

export type Predicate = Ish<boolean>;
export type RunResult = CommandResult | void | string | Command[];
export type RunFunction = () => Promise<RunResult>;
