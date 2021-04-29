import {
  Dependency,
  NeedsDependenciesDone,
  NeedsExclusiveLock,
} from "./dependency.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}

export type CommandType =
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
  | "Exec"
  | "Noop";

export interface Command
  extends NeedsExclusiveLock, NeedsDependenciesDone, Dependency {
  readonly type: CommandType;
  readonly run: () => Promise<CommandResult>;
  readonly toString: () => string;
}
