import { Queue } from "./queue.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
  all: string;
}

export type CommandType =
  | "OsPackage"
  | "UpdateOsPackages"
  | "SymlinkElsewhere"
  | "DropFile"
  | "LineInFile"
  | "ParallelCommand";

export interface Command {
  readonly type: CommandType;
  readonly run: (queue: Queue) => Promise<CommandResult>;
  readonly cancel: () => Promise<void>;
  readonly toString: () => string;
}
