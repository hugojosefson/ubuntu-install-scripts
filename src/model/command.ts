import { defer, Deferred } from "../os/defer.ts";
import {
  Dependency,
  DependencyId,
  Lock,
  NeedsDependenciesDone,
  NeedsExclusiveLocks,
} from "./dependency.ts";

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

export interface Command
  extends NeedsExclusiveLocks, NeedsDependenciesDone, Dependency {
  readonly type: CommandType;
  run(): Promise<CommandResult>;
  toString(): string;
}

export abstract class AbstractCommand implements Command {
  readonly type: CommandType;
  readonly id: DependencyId;
  readonly dependencies: Array<Dependency> = [];
  readonly locks: Array<Lock> = [];
  readonly doneDeferred: Deferred<CommandResult> = defer();
  readonly done: Promise<CommandResult> = this.doneDeferred.promise;

  protected constructor(commandType: CommandType, id: DependencyId) {
    this.type = commandType;
    this.id = id;
  }

  toString() {
    return JSON.stringify(this);
  }

  run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }
    return this.resolve();
  }

  protected resolve(commandResult: CommandResult = {
    status: { success: true, code: 0 },
    stdout: "",
    stderr: "",
  }): Promise<CommandResult> {
    this.doneDeferred.resolve(commandResult);
    return this.done;
  }
}
export class CustomCommand extends AbstractCommand {
  constructor(id: DependencyId) {
    super("Custom", id);
  }
  withDependencies(dependencies: Array<Dependency>): CustomCommand {
    this.dependencies.push(...dependencies);
    return this;
  }
  withLocks(locks: Array<Lock>): CustomCommand {
    this.locks.push(...locks);
    return this;
  }
  withRunInner(runInner: () => Promise<CommandResult>) {
    runInner().then();
  }
}
