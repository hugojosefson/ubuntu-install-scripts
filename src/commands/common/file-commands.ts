import dropFile from "../../../lib/drop-file.ts";
import ensureLineInFile from "../../../lib/ensure-line-in-file.ts";
import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { notImplementedYet } from "../../model/not-implemented-yet.ts";
import { Progress, Started } from "../../model/progress.ts";
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

  abstract run(
    emitProgress: (progress: Progress) => void,
    queue: Queue,
  ): Promise<CommandResult>;
}

export class DropFile extends AbstractFileCommand {
  readonly type: "DropFile" = "DropFile";
  readonly contents: string;

  constructor(path: string, contents: string, mode?: number) {
    super(path, mode);
    this.contents = contents;
  }

  async run(
    emitProgress: (progress: Progress) => void,
  ): Promise<CommandResult> {
    emitProgress(new Started(this));
    const result: void = await dropFile(this.mode)(this.contents)(this.path);
    return {
      stdout: `Dropped file ${this.toString()}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}

export class DropExecutable extends DropFile {
  constructor(path: string, contents: string) {
    super(path, contents, 0o775);
  }
}

export class LineInFile extends AbstractFileCommand {
  readonly type: "LineInFile" = "LineInFile";
  readonly line: string;

  constructor(path: string, line: string) {
    super(path);
    this.line = line;
  }

  async run(
    emitProgress: (progress: Progress) => void,
  ): Promise<CommandResult> {
    emitProgress(new Started(this));
    const result = ensureLineInFile(this.line)(this.path);
    return {
      stdout: `Line ensured in file ${this.toString()}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}

async function isDirectoryEmpty(directory: string) {
  return (await (Deno.readDirSync(directory))
    [Symbol.iterator]()
    .next()).done;
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

  async run(
    emitProgress: (progress: Progress) => void,
  ): Promise<CommandResult> {
    emitProgress(new Started(this));
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
