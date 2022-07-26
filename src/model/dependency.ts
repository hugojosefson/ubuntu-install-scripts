import { config } from "../config.ts";
import { memoize, PasswdEntry } from "../deps.ts";
import { defer, deferAlreadyResolvedVoid, Deferred } from "../os/defer.ts";
import { resolvePath } from "../os/resolve-path.ts";
import { ROOT } from "../os/user/target-user.ts";

export type LockReleaser = () => void;

export class Lock {
  private currentLock: Deferred<void> = deferAlreadyResolvedVoid();

  async take(): Promise<LockReleaser> {
    const previousLock = this.currentLock.promise;
    this.currentLock = defer();
    await previousLock;
    return this.currentLock.resolve;
  }
}

export class FileSystemPath extends Lock {
  readonly path: string;

  private constructor(path: string) {
    super();
    this.path = path;
  }

  toString(): string {
    return `${this.constructor.name}(${this.path})`;
  }

  private static ofAbsolutePath(absolutePath: string): FileSystemPath {
    config.VERBOSE && console.warn(
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
    config.VERBOSE && console.warn(
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
    config.VERBOSE && console.warn(
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
    config.VERBOSE && console.warn(
      `of(user: ${JSON.stringify(user)}, path: ${
        JSON.stringify(path)
      }): resolvedPath is: ${resolvedPath}`,
    );
    const fileSystemPath = FileSystemPath.ofAbsolutePathMemoized(resolvedPath);
    config.VERBOSE && console.warn(
      `of(user: ${JSON.stringify(user)}, path: ${
        JSON.stringify(path)
      }): fileSystemPath is: ${fileSystemPath}`,
    );
    return fileSystemPath;
  }
}

export const OS_PACKAGE_SYSTEM: Lock = FileSystemPath.of(
  ROOT,
  "/var/lib/apt",
);

export const FLATPAK = OS_PACKAGE_SYSTEM;
