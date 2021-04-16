import { isSuccessful } from "../../os/exec.ts";
import resolvePath from "../../os/resolve-path.ts";
import { dirname } from "../../deps.ts";
import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { notImplementedYet } from "../../model/not-implemented-yet.ts";
import { Queue } from "../../model/queue.ts";

export abstract class AbstractFileCommand implements Command {
  abstract readonly type: CommandType;

  readonly path: string;
  readonly mode?: number;
  readonly cancel = notImplementedYet(this, "cancel");

  protected constructor(path: string, mode?: number) {
    this.path = path;
    this.mode = mode;
  }

  toString() {
    return JSON.stringify({
      type: this.type,
      path: this.path,
      mode: this.mode,
    });
  }

  abstract run(queue: Queue): Promise<CommandResult>;
}

const createFile = (mode?: number) =>
  (contents: string) =>
    async (path: string) => {
      const resolvedPath: string = resolvePath(path);
      const options: Deno.WriteFileOptions = mode ? { mode } : {};
      const data: Uint8Array = new TextEncoder().encode(contents);
      await Deno.mkdir(dirname(resolvedPath), { recursive: true });
      await Deno.writeFile(resolvedPath, data, options);
    };

export class CreateFile extends AbstractFileCommand {
  readonly type: "CreateFile" = "CreateFile";
  readonly contents: string;

  constructor(path: string, contents: string, mode?: number) {
    super(path, mode);
    this.contents = contents;
  }

  async run(): Promise<CommandResult> {
    const result: void = await createFile(this.mode)(this.contents)(this.path);
    return {
      stdout: `Created file ${this.toString()}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}

export class CreateExecutable extends CreateFile {
  constructor(path: string, contents: string) {
    super(path, contents, 0o775);
  }
}

export class DropExecutable extends CreateFile {
  constructor(path: string, contents: string) {
    super(path, contents, 0o775);
  }
}
const ensureLineInFile = (line: string, endWithNewline = true) =>
  async (file: string): Promise<void> => {
    const resolvedPath = resolvePath(file);
    if (await isSuccessful(["grep", line, resolvedPath])) {
      return;
    }
    const prefix = "\n";
    const suffix = endWithNewline ? "\n" : "";
    const data = new TextEncoder().encode(prefix + line + suffix);
    return Deno.writeFile(resolvedPath, data, {
      append: true,
      create: true,
    });
  };

export class LineInFile extends AbstractFileCommand {
  readonly type: "LineInFile" = "LineInFile";
  readonly line: string;

  constructor(path: string, line: string) {
    super(path);
    this.line = line;
  }

  run(): Promise<CommandResult> {
    const result = ensureLineInFile(this.line)(this.path);
    return Promise.resolve({
      stdout: `Line ensured in file ${this.toString()}.`,
      stderr: "",
      all: "",
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

  constructor(target: string, directory: string) {
    super(directory);
    this.target = target;
  }

  private result(partialCommandResult: Partial<CommandResult>): CommandResult {
    return {
      stdout: "",
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
      ...partialCommandResult,
    };
  }

  async run(): Promise<CommandResult> {
    const ifExists = async (pathStat: Deno.FileInfo) => {
      if (
        pathStat.isSymlink && await Deno.readLink(this.path) === this.target
      ) {
        return this.result({
          stdout: `"${this.path}" is already a symlink to "${this.target}".`,
        });
      }

      if (pathStat.isDirectory && await isDirectoryEmpty(this.path)) {
        await Deno.remove(this.path);
        await Deno.symlink(this.target, this.path);
        return this.result({
          stdout:
            `Replaced empty directory "${this.path}" with a symlink to "${this.target}".`,
        });
      }

      const newpath = `${this.path}-${Math.ceil(Math.random() * 10e5)}`;
      await Deno.rename(this.path, newpath);

      await Deno.symlink(this.target, this.path);
      return this.result({
        stdout:
          `Renamed existing "${this.path}" to "${newpath}", then replaced it with a symlink to "${this.target}".`,
      });
    };

    const ifNotExists = async () => {
      await Deno.symlink(this.target, this.path);
      return this.result({
        stdout: `Created "${this.path}" as a symlink to "${this.target}".`,
      });
    };

    return await Deno.lstat(this.path).then(ifExists, ifNotExists);
  }
}
