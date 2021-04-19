import { dirname, PasswdEntry } from "../../deps.ts";
import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Queue } from "../../model/queue.ts";
import { isSuccessful, symlink } from "../../os/exec.ts";
import { resolvePath } from "../../os/resolve-path.ts";
import { ROOT } from "../../os/user/target-user.ts";

export abstract class AbstractFileCommand implements Command {
  abstract readonly type: CommandType;

  readonly owner: PasswdEntry;
  readonly path: string;
  readonly mode?: number;

  protected constructor(owner: PasswdEntry, path: string, mode?: number) {
    this.owner = owner;
    this.path = resolvePath(owner, path);
    this.mode = mode;
  }

  toString() {
    return JSON.stringify({
      owner: this.owner,
      type: this.type,
      path: this.path,
      mode: this.mode,
    });
  }

  abstract run(queue: Queue): Promise<CommandResult>;
}

const existsDir = async (dirSegments: Array<string>): Promise<boolean> => {
  try {
    const dirInfo: Deno.FileInfo = await Deno.stat(asPath(dirSegments));
    return dirInfo.isDirectory;
  } catch {
    return false;
  }
};

const asPath = (pathSegments: Array<string>): string =>
  "/" + pathSegments.join("/");

const getParentDirSegments = (dirSegments: Array<string>) =>
  dirSegments.slice(0, dirSegments.length - 1);

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

const createFile = async (
  owner: PasswdEntry,
  path: string,
  contents: string,
  mode?: number,
) => {
  const resolvedPath: string = resolvePath(owner, path);
  await mkdirp(owner, dirname(resolvedPath).split("/"));

  const data: Uint8Array = new TextEncoder().encode(contents);
  const options: Deno.WriteFileOptions = mode ? { mode } : {};

  await Deno.writeFile(resolvedPath, data, options);
  await Deno.chown(resolvedPath, owner.uid, owner.gid);
};

export class CreateFile extends AbstractFileCommand {
  readonly type: "CreateFile" = "CreateFile";
  readonly contents: string;

  constructor(
    owner: PasswdEntry,
    path: string,
    contents: string,
    mode?: number,
  ) {
    super(owner, path, mode);
    this.contents = contents;
  }

  async run(): Promise<CommandResult> {
    await createFile(
      this.owner,
      this.path,
      this.contents,
      this.mode,
    );
    return {
      stdout: `Created file ${this.toString()}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

const createDir = async (
  owner: PasswdEntry,
  path: string,
) => {
  const resolvedPath: string = resolvePath(owner, path);
  await mkdirp(owner, resolvedPath.split("/"));
};

export class CreateDir implements Command {
  readonly type: "CreateDir" = "CreateDir";
  readonly owner: PasswdEntry;
  readonly path: string;

  constructor(owner: PasswdEntry, path: string) {
    this.owner = owner;
    this.path = path;
  }

  toString() {
    return JSON.stringify({
      owner: this.owner,
      type: this.type,
      path: this.path,
    });
  }

  async run(): Promise<CommandResult> {
    await createDir(this.owner, this.path);
    return {
      stdout: `Created dir ${this.toString()}.`,
      stderr: "",
      status: { success: true, code: 0 },
    };
  }
}

export const MODE_EXECUTABLE_775: number = 0o755;

const ensureLineInFile = (
  line: string,
  endWithNewline = true,
) =>
  async (owner: PasswdEntry, file: string): Promise<void> => {
    const resolvedPath = resolvePath(owner, file);
    if (await isSuccessful(ROOT, ["grep", line, resolvedPath])) {
      return;
    }
    const prefix = "\n";
    const suffix = endWithNewline ? "\n" : "";
    const data = new TextEncoder().encode(prefix + line + suffix);
    await Deno.writeFile(resolvedPath, data, {
      append: true,
      create: true,
    });
    await Deno.chown(resolvedPath, owner.uid, owner.gid);
  };

export class LineInFile extends AbstractFileCommand {
  readonly type: "LineInFile" = "LineInFile";
  readonly line: string;

  constructor(owner: PasswdEntry, path: string, line: string) {
    super(owner, path);
    this.line = line;
  }

  run(): Promise<CommandResult> {
    const result = ensureLineInFile(this.line)(this.owner, this.path);
    return Promise.resolve({
      stdout: `Line ensured in file ${this.toString()}.`,
      stderr: "",
      status: { success: true, code: 0 },
    });
  }
}

async function isDirectoryEmpty(directory: string) {
  return (await (Deno.readDirSync(directory))[Symbol.iterator]().next()).done;
}

export class SymlinkElsewhere extends AbstractFileCommand {
  readonly type: "SymlinkElsewhere" = "SymlinkElsewhere";
  readonly target: string;

  constructor(owner: PasswdEntry, directory: string, target: string) {
    super(owner, directory);
    this.target = resolvePath(owner, target);
  }

  private result(partialCommandResult: Partial<CommandResult>): CommandResult {
    return {
      stdout: "",
      stderr: "",
      status: { success: true, code: 0 },
      ...partialCommandResult,
    };
  }

  async run(): Promise<CommandResult> {
    const ifExists = async (pathStat: Deno.FileInfo) => {
      if (
        pathStat.isSymlink && await Deno.readLink(this.path) === this.target
      ) {
        if (
          pathStat.uid === this.owner.uid && pathStat.gid === this.owner.gid
        ) {
          return this.result({
            stdout: `"${this.path}" is already a symlink to "${this.target}".`,
          });
        }
        await Deno.remove(this.path);
        await symlink(this.owner, this.target, this.path);

        return this.result({
          stdout:
            `Replaced correct (but incorrectly owned) symlink "${this.path}" to "${this.target}", with correctly owned symlink.`,
        });
      }

      if (pathStat.isDirectory && await isDirectoryEmpty(this.path)) {
        await Deno.remove(this.path);
        await symlink(this.owner, this.target, this.path);

        return this.result({
          stdout:
            `Replaced empty directory "${this.path}" with a symlink to "${this.target}".`,
        });
      }

      const newpath = `${this.path}-${Math.ceil(Math.random() * 10e5)}`;
      await Deno.rename(this.path, newpath);

      await symlink(this.owner, this.target, this.path);
      return this.result({
        stdout:
          `Renamed existing "${this.path}" to "${newpath}", then replaced it with a symlink to "${this.target}".`,
      });
    };

    const ifNotExists = async () => {
      await mkdirp(this.owner, getParentDirSegments(this.path.split("/")));
      await symlink(this.owner, this.target, this.path);
      return this.result({
        stdout: `Created "${this.path}" as a symlink to "${this.target}".`,
      });
    };

    return await Deno.lstat(this.path).then(ifExists, ifNotExists);
  }
}
