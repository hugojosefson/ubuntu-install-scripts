import { dirname, PasswdEntry } from "../../deps.ts";
import { Command, CommandResult, RunResult } from "../../model/command.ts";
import { FileSystemPath } from "../../model/dependency.ts";
import { ensureSuccessful, isSuccessful, symlink } from "../../os/exec.ts";
import { ROOT } from "../../os/user/target-user.ts";

export abstract class AbstractFileCommand extends Command {
  readonly owner: PasswdEntry;
  readonly path: FileSystemPath;
  readonly mode?: number;

  protected constructor(
    owner: PasswdEntry,
    path: FileSystemPath,
    mode?: number,
  ) {
    super();
    this.owner = owner;
    this.path = path;
    this.mode = mode;
    this.locks.push(this.path);
  }

  toString(): string {
    return `${this.constructor.name}(${this.owner.username}, ${this.path}, ${this.mode})`;
  }

  abstract run(): Promise<RunResult>;
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
  shouldBackupAnyExistingFile = false,
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
      owner,
      path,
      mode,
    );
    this.contents = contents;
    this.shouldBackupAnyExistingFile = shouldBackupAnyExistingFile;
  }

  async run(): Promise<RunResult> {
    const backupFilePath: FileSystemPath | undefined = await createFile(
      this.owner,
      this.path,
      this.contents,
      this.shouldBackupAnyExistingFile,
      this.mode,
    );
    return `Created file ${this.toString()}.` +
      (backupFilePath ? `\nBacked up previous file to ${backupFilePath}` : "");
  }
}

const createDir = async (
  owner: PasswdEntry,
  path: FileSystemPath,
) => {
  await mkdirp(owner, path.path.split("/"));
};

export class CreateDir extends Command {
  readonly owner: PasswdEntry;
  readonly path: FileSystemPath;

  constructor(owner: PasswdEntry, path: FileSystemPath) {
    super();
    this.locks.push(path);
    this.owner = owner;
    this.path = path;
  }

  toString(): string {
    return `${this.constructor.name}(${this.owner.username}, ${this.path})`;
  }

  async run(): Promise<RunResult> {
    await createDir(this.owner, this.path);
    return `Created dir ${this.toString()}.`;
  }
}

export const MODE_EXECUTABLE_775 = 0o755;

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
      owner,
      path,
    );
    this.line = line;
  }

  toString(): string {
    return `${this.constructor.name}(${this.owner.username}, ${this.path}, ${
      JSON.stringify(this.line)
    })`;
  }

  async run(): Promise<RunResult> {
    await ensureLineInFile(this.line)(this.owner, this.path);
    return `Line ensured in file ${this.toString()}.`;
  }
}

export class UserInGroup extends Command {
  readonly user: PasswdEntry;
  readonly group: string;

  constructor(user: PasswdEntry, group: string) {
    super();
    this.user = user;
    this.group = group;
  }

  async run(): Promise<RunResult> {
    return await ensureUserInGroup(this.user, this.group);
  }
}

async function isDirectoryEmpty(directory: FileSystemPath) {
  return (await (Deno.readDirSync(directory.path))[Symbol.iterator]().next())
    .done;
}

export class Symlink extends AbstractFileCommand {
  readonly target: string;

  constructor(owner: PasswdEntry, from: string, to: FileSystemPath) {
    super(owner, to);
    this.target = from;
  }

  async run(): Promise<RunResult> {
    const ifExists = async (
      pathStat: Deno.FileInfo,
    ) => {
      if (
        pathStat.isSymlink &&
        await Deno.readLink(this.path.path) === this.target
      ) {
        if (
          pathStat.uid === this.owner.uid && pathStat.gid === this.owner.gid
        ) {
          return `"${this.path}" is already a symlink to "${this.target}".`;
        }
        await Deno.remove(this.path.path);
        await symlink(this.owner, this.target, this.path);

        return `Replaced correct (but incorrectly owned) symlink "${this.path}" to "${this.target}", with correctly owned symlink.`;
      }

      if (pathStat.isDirectory && await isDirectoryEmpty(this.path)) {
        await Deno.remove(this.path.path);
        await symlink(this.owner, this.target, this.path);

        return `Replaced empty directory "${this.path}" with a symlink to "${this.target}".`;
      }

      const newpath = `${this.path.path}-${Math.ceil(Math.random() * 10e5)}`;
      await Deno.rename(this.path.path, newpath);

      await symlink(this.owner, this.target, this.path);
      return `Renamed existing "${this.path}" to "${newpath}", then replaced it with a symlink to "${this.target}".`;
    };

    const ifNotExists = async () => {
      await mkdirp(this.owner, getParentDirSegments(this.path.path.split("/")));
      await symlink(this.owner, this.target, this.path);
      return `Created "${this.path}" as a symlink to "${this.target}".`;
    };

    return await Deno.lstat(this.path.path)
      .then(
        ifExists,
        ifNotExists,
      );
  }
}
