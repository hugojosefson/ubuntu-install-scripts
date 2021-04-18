import { Queue } from "./queue.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
  all: string;
}

export type CommandType =
  | "InstallOsPackage"
  | "RemoveOsPackage"
  | "UpgradeOsPackages"
  | "InstallAurPackage"
  | "RemoveAurPackage"
  | "SymlinkElsewhere"
  | "CreateFile"
  | "LineInFile"
  | "ParallelCommand"
  | "SequentialCommand";

export interface Command {
  readonly type: CommandType;
  readonly run: (queue: Queue) => Promise<CommandResult>;
  readonly toString: () => string;
}
