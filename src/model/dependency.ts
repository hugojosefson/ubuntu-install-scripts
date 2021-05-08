import { config } from "../config.ts";
import { memoize, PasswdEntry } from "../deps.ts";
import { defer, deferAlreadyResolvedVoid, Deferred } from "../os/defer.ts";
import { resolvePath } from "../os/resolve-path.ts";
import { ROOT } from "../os/user/target-user.ts";
import { Cloneable } from "./cloneable.ts";
import { Command } from "./command.ts";

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

export type ReleaseLockFn = () => void;
export class Lock {
  private currentLock: Deferred<void> = deferAlreadyResolvedVoid();

  async take(): Promise<ReleaseLockFn> {
    const previousLock = this.currentLock.promise;
    this.currentLock = defer();
    await previousLock;
    return this.currentLock.resolve;
  }
}

export class FileSystemPath extends Lock {
  readonly id: DependencyId;
  readonly path: string;

  private constructor(path: string) {
    super();
    this.id = new DependencyId("FileSystemPath", path);
    this.path = path;
  }
  toString(): string {
    return this.id.toString();
  }

  private static ofAbsolutePath(absolutePath: string): FileSystemPath {
    config.verbose && console.warn(
      `ofAbsolutePath(absolutePath: ${JSON.stringify(absolutePath)})`,
    );
    if (!absolutePath) {
      throw new Error(
        `ofAbsolutePath(absolutePath: ${
          JSON.stringify(absolutePath)
        }): absolutePath is not.`,
      );
    }
    const fileSystemPath = new FileSystemPath(absolutePath);
    config.verbose && console.warn(
      `ofAbsolutePath(absolutePath: ${
        JSON.stringify(absolutePath)
      }): fileSystemPath is: ${JSON.stringify(fileSystemPath)}`,
    );
    return fileSystemPath;
  }

  private static ofAbsolutePathMemoized: (path: string) => FileSystemPath =
    memoize(
      FileSystemPath.ofAbsolutePath,
    );

  static of(user: PasswdEntry, path: string): FileSystemPath {
    config.verbose && console.warn(
      `of(user: ${JSON.stringify(user)}, path: ${JSON.stringify(path)})`,
    );
    const resolvedPath: string = resolvePath(user, path);
    if (!resolvedPath) {
      throw new Error(
        `of(user: ${JSON.stringify(user)}, path: ${
          JSON.stringify(path)
        }): resolvedPath is not.`,
      );
    }
    config.verbose && console.warn(
      `of(user: ${JSON.stringify(user)}, path: ${
        JSON.stringify(path)
      }): resolvedPath is: ${resolvedPath}`,
    );
    const fileSystemPath = FileSystemPath.ofAbsolutePathMemoized(resolvedPath);
    config.verbose && console.warn(
      `of(user: ${JSON.stringify(user)}, path: ${
        JSON.stringify(path)
      }): fileSystemPath is: ${fileSystemPath}`,
    );
    return fileSystemPath;
  }
}

export const OS_PACKAGE_SYSTEM: Lock = FileSystemPath.of(
  ROOT,
  "/var/lib/pacman",
);

export const FLATPAK = OS_PACKAGE_SYSTEM;
