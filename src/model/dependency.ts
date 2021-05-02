import { memoize, PasswdEntry } from "../deps.ts";
import { resolvePath } from "../os/resolve-path.ts";
import { ROOT } from "../os/user/target-user.ts";
import { CommandResult } from "./command.ts";

export class DependencyId {
  readonly type: string;
  readonly value: string;
  constructor(type: string, value: string | Record<string, any>) {
    this.type = type;
    this.value = typeof value === "string" ? value : JSON.stringify(value);
  }
  toString(): string {
    return JSON.stringify({ type: this.type, value: this.value });
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
  readonly path: string;

  private constructor(path: string) {
    this.id = new DependencyId("FileSystemPath", path);
    this.path = path;
  }
  toString(): string {
    return this.id.toString();
  }

  private static ofAbsolutePath: (path: string) => FileSystemPath = memoize(
    (absolutePath: string): FileSystemPath => new FileSystemPath(absolutePath),
  );

  static of = (user: PasswdEntry, path: string): FileSystemPath =>
    FileSystemPath.ofAbsolutePath(resolvePath(user, path));
}

export const OS_PACKAGE_SYSTEM: Lock = FileSystemPath.of(
  ROOT,
  "/var/lib/pacman",
);

export const FLATPAK = OS_PACKAGE_SYSTEM;
