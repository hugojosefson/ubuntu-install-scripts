import { memoize, PasswdEntry } from "../deps.ts";
import { resolvePath } from "../os/resolve-path.ts";
import { ROOT } from "../os/user/target-user.ts";
import { Cloneable } from "./cloneable.ts";
import { Command, CommandResult } from "./command.ts";

function cloneValue(
  value?: string | Record<string, any>,
): Record<string, any> {
  if (!value) {
    return { cloneLevel: 1 };
  }
  if (typeof value === "string") {
    return { originalValue: value, cloneLevel: 1 };
  }
  return { ...value, cloneLevel: (value.cloneLevel ?? 0) + 1 };
}

export class DependencyId implements Cloneable<DependencyId> {
  readonly type: string;
  readonly value: string;
  constructor(type: string, value?: string | Record<string, any>) {
    this.type = type;
    this.value = typeof value === "string" ? value : JSON.stringify(value);
  }
  toString(): string {
    return JSON.stringify({ type: this.type, value: this.value });
  }

  clone(): DependencyId {
    return new DependencyId(this.type, cloneValue(this.value));
  }
}

export interface NeedsDependenciesDone {
  readonly dependencies: Array<Command>;
}

export interface NeedsExclusiveLocks {
  readonly locks: Array<Lock>;
}

/** Marker interface. Will be handled by p-queue. */
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
