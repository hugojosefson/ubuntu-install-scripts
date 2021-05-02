import { dirname, PasswdEntry } from "../../deps.ts";
import {
  AbstractCommand,
  CommandResult,
  CommandType,
} from "../../model/command.ts";
import { DependencyId, FileSystemPath } from "../../model/dependency.ts";
import { ensureSuccessful, isSuccessful, symlink } from "../../os/exec.ts";
import { ROOT } from "../../os/user/target-user.ts";

export abstract class AbstractFileCommand extends AbstractCommand {
  readonly owner: PasswdEntry;
  readonly path: FileSystemPath;
  readonly mode?: number;

  protected constructor(
    commandType: CommandType,
    id: DependencyId,
    owner: PasswdEntry,
    path: FileSystemPath,
    mode?: number,
  ) {
    super(commandType, id);
    this.owner = owner;
    this.path = path;
    this.mode = mode;
    this.locks.push(this.path);
  }

  abstract run(): Promise<CommandResult>;
}

const existsDir = async (dirSegments: Array<string>): Promise<boolean> => {
  try {
    const dirInfo: Deno.FileInfo = await Deno.stat(asPath(dirSegments));
    return dirInfo.isDirectory;
  } catch {
    return false;
  }
};

const existsPath = async (dirSegments: Array<string>): Promise<boolean> => {
  try {
    await Deno.stat(asPath(dirSegments));
    return true;
  } catch {
    return false;
  }
};

const asPath = (pathSegments: Array<string>): string =>
  "/" + pathSegments.join("/");

const getParentDirSegments = (dirSegments: Array<string>) =>
  dirSegments.slice(0, dirSegments.length - 1);

const asPathSegments = (path: FileSystemPath): Array<string> =>
  path.path.split("/");

const mkdirp = async (
  owner: PasswdEntry,
  dirSegments: Array<string>,
): Promise<void> => {
  if (await existsDir(dirSegments)) {
    await Deno.chown(asPath(dirSegments), owner.uid, owner.gid);
    return;
  }
  if (dirSegments.length === 0) {
    return;
  }
  await mkdirp(owner, getParentDirSegments(dirSegments));
  await Deno.mkdir(asPath(dirSegments)).then(
    () => {},
    (reason) =>
      reason?.name === "AlreadyExists"
        ? Promise.resolve()
        : Promise.reject(reason),
  );
  await Deno.chown(asPath(dirSegments), owner.uid, owner.gid);
};

const backupFileUnlessContentAlready = async (
  filePath: FileSystemPath,
  contents: string,
): Promise<FileSystemPath | undefined> => {
  if (!await existsPath(asPathSegments(filePath))) {
    return undefined;
  }
  if ((await Deno.readTextFile(filePath.path)) == contents) {
    return undefined;
  }

  const backupFilePath: FileSystemPath = FileSystemPath.of(
    ROOT,
    `${filePath.path}.${Date.now()}.backup`,
  );
  await Deno.rename(filePath.path, backupFilePath.path);
  return backupFilePath;
};

/**
 * Creates a file. If it creates a backup of any existing file, its Promise resolves to that path. Otherwise to undefined.
 */
const createFile = async (
  owner: PasswdEntry,
  path: FileSystemPath,
  contents: string,
  shouldBackupAnyExistingFile: boolean = false,
  mode?: number,
): Promise<FileSystemPath | undefined> => {
  await mkdirp(owner, dirname(path.path).split("/"));

  const data: Uint8Array = new TextEncoder().encode(contents);
  const options: Deno.WriteFileOptions = mode ? { mode } : {};

  const backupFilePath: FileSystemPath | undefined = shouldBackupAnyExistingFile
    ? await backupFileUnlessContentAlready(path, contents)
    : undefined;

  await Deno.writeFile(path.path, data, options);
  await Deno.chown(path.path, owner.uid, owner.gid);
  return backupFilePath;
};

export class CreateFile extends AbstractFileCommand {
  readonly contents: string;
  readonly shouldBackupAnyExistingFile: boolean;

  constructor(
    owner: PasswdEntry,
    path: FileSystemPath,
    contents: string,
    shouldBackupAnyExistingFile: boolean = false,
    mode?: number,
  ) {
    super(
      "CreateFile",
      new DependencyId("CreateFile", path),
      owner,
      path,
      mode,
    );
    this.contents = contents;
    this.shouldBackupAnyExistingFile = shouldBackupAnyExistingFile;
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    createFile(
      this.owner,
      this.path,
      this.contents,
      this.shouldBackupAnyExistingFile,
      this.mode,
    ).then(
      (backupFilePath: FileSystemPath | undefined) =>
        this.doneDeferred.resolve({
          stdout: `Created file ${this.toString()}.` +
            (backupFilePath
              ? `\nBacked up previous file to ${backupFilePath}`
              : ""),
          stderr: "",
          status: { success: true, code: 0 },
        }),
      this.doneDeferred.reject,
    );

    return this.done;
  }
}

const createDir = async (
  owner: PasswdEntry,
  path: FileSystemPath,
) => {
  await mkdirp(owner, path.path.split("/"));
};

export class CreateDir extends AbstractCommand {
  readonly owner: PasswdEntry;
  readonly path: FileSystemPath;

  constructor(owner: PasswdEntry, path: FileSystemPath) {
    super("CreateDir", new DependencyId("CreateDir", path));
    this.locks.push(path);
    this.owner = owner;
    this.path = path;
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    await createDir(this.owner, this.path)
      .catch(this.doneDeferred.reject);

    this.doneDeferred.resolve({
      stdout: `Created dir ${this.toString()}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
    return this.done;
  }
}

export const MODE_EXECUTABLE_775: number = 0o755;

const ensureLineInFile = (
  line: string,
  endWithNewline = true,
) =>
  async (owner: PasswdEntry, file: FileSystemPath): Promise<void> => {
    if (await isSuccessful(ROOT, ["grep", line, file.path])) {
      return;
    }
    const prefix = "\n";
    const suffix = endWithNewline ? "\n" : "";
    const data = new TextEncoder().encode(prefix + line + suffix);
    await Deno.writeFile(file.path, data, {
      append: true,
      create: true,
    });
    await Deno.chown(file.path, owner.uid, owner.gid);
  };

function ensureUserInGroup(
  user: PasswdEntry,
  group: string,
): Promise<CommandResult> {
  return ensureSuccessful(
    ROOT,
    ["usermod", "-aG", group, user.username],
    {},
  );
}

export class LineInFile extends AbstractFileCommand {
  readonly line: string;

  constructor(owner: PasswdEntry, path: FileSystemPath, line: string) {
    super(
      "LineInFile",
      new DependencyId("LineInFile", { path, line }),
      owner,
      path,
    );
    this.line = line;
  }

  run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    ensureLineInFile(this.line)(this.owner, this.path)
      .catch(this.doneDeferred.reject);

    return this.resolve({
      stdout: `Line ensured in file ${this.toString()}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }
}

export class UserInGroup extends AbstractCommand {
  readonly user: PasswdEntry;
  readonly group: string;

  constructor(user: PasswdEntry, group: string) {
    super(
      "UserInGroup",
      new DependencyId("UserInGroup", { user, group }),
    );
    this.user = user;
    this.group = group;
  }

  run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    ensureUserInGroup(this.user, this.group)
      .then(this.doneDeferred.resolve, this.doneDeferred.reject);

    return this.done;
  }
}

async function isDirectoryEmpty(directory: FileSystemPath) {
  return (await (Deno.readDirSync(directory.path))[Symbol.iterator]().next())
    .done;
}

export class Symlink extends AbstractFileCommand {
  readonly type: "Symlink" = "Symlink";
  readonly target: string;

  constructor(owner: PasswdEntry, from: string, to: FileSystemPath) {
    super("Symlink", new DependencyId("Symlink", { from, to }), owner, to);
    this.target = from;
  }

  private static result(
    partialCommandResult: Partial<CommandResult>,
  ): CommandResult {
    return {
      stdout: "",
      stderr: "",
      status: { success: true, code: 0 },
      ...partialCommandResult,
    };
  }

  async run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    const ifExists = async (pathStat: Deno.FileInfo) => {
      if (
        pathStat.isSymlink &&
        await Deno.readLink(this.path.path) ===
          await Deno.readLink(this.target)
      ) {
        if (
          pathStat.uid === this.owner.uid && pathStat.gid === this.owner.gid
        ) {
          return Symlink.result({
            stdout: `"${this.path}" is already a symlink to "${this.target}".`,
          });
        }
        await Deno.remove(this.path.path);
        await symlink(this.owner, this.target, this.path);

        return Symlink.result({
          stdout:
            `Replaced correct (but incorrectly owned) symlink "${this.path}" to "${this.target}", with correctly owned symlink.`,
        });
      }

      if (pathStat.isDirectory && await isDirectoryEmpty(this.path)) {
        await Deno.remove(this.path.path);
        await symlink(this.owner, this.target, this.path);

        return Symlink.result({
          stdout:
            `Replaced empty directory "${this.path}" with a symlink to "${this.target}".`,
        });
      }

      const newpath = `${this.path.path}-${Math.ceil(Math.random() * 10e5)}`;
      await Deno.rename(this.path.path, newpath);

      await symlink(this.owner, this.target, this.path);
      return Symlink.result({
        stdout:
          `Renamed existing "${this.path}" to "${newpath}", then replaced it with a symlink to "${this.target}".`,
      });
    };

    const ifNotExists = async () => {
      await mkdirp(this.owner, getParentDirSegments(this.path.path.split("/")));
      await symlink(this.owner, this.target, this.path);
      return Symlink.result({
        stdout: `Created "${this.path}" as a symlink to "${this.target}".`,
      });
    };

    Deno.lstat(this.path.path)
      .then(
        ifExists,
        ifNotExists,
      )
      .then(
        this.resolve.bind(this),
        this.doneDeferred.reject,
      );

    return this.done;
  }
}
