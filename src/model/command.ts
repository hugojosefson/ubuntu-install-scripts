import { Queue } from "./queue.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}

export type CommandType =
  | "InstallOsPackage"
  | "RemoveOsPackage"
  | "SwitchOsPackage"
  | "UpgradeOsPackages"
  | "InstallAurPackage"
  | "RemoveAurPackage"
  | "InstallFlatpakPackage"
  | "RemoveFlatpakPackage"
  | "Symlink"
  | "CreateFile"
  | "CreateDir"
  | "LineInFile"
  | "Exec"
  | "Noop"
  | "ParallelCommand"
  | "SequentialCommand";

export interface Command {
  readonly type: CommandType;
  readonly run: (queue: Queue) => Promise<CommandResult>;
  readonly toString: () => string;
}
