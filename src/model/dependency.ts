import { memoize } from "../deps.ts";
import { CommandResult } from "./command.ts";

export class DependencyId {
  readonly type: string;
  readonly value: string;
  constructor(type: string, value: string | Record<string, any>) {
    this.type = type;
    this.value = typeof value === "string" ? value : JSON.stringify(value);
  }
}

export interface Dependency {
  readonly id: DependencyId;
  readonly done: Promise<CommandResult>;
}

export interface NeedsDependenciesDone {
  readonly dependencies: Array<Dependency>;
}

export interface NeedsExclusiveLock {
  readonly locks: Array<Lock>;
}

export interface Lock {
}

export class FileSystemPath implements Lock {
  readonly id: DependencyId;
  private constructor(path: string) {
    this.id = new DependencyId("FileSystemPath", path);
  }
  static of: (path: string) => FileSystemPath = memoize((
    path: string,
  ): FileSystemPath => new FileSystemPath(Deno.realPathSync(path)));
}

export const OS_PACKAGE_SYSTEM: Lock = FileSystemPath.of(
  "/var/lib/pacman",
);

export const FLATPAK = OS_PACKAGE_SYSTEM;
