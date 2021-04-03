import { Progress } from "./progress.ts";
import { Queue } from "./queue.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
  all: string;
}

export type CommandType =
  | "OsPackage"
  | "DropFile"
  | "LineInFile"
  | "ParallelCommand";

export interface Command {
  readonly type: CommandType;
  readonly run: (
    emitProgress: (progress: Progress) => void,
    queue: Queue,
  ) => Promise<CommandResult>;
  readonly cancel: () => Promise<void>;
  readonly toString: () => string;
}
