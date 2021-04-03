import dropFile from "../../../lib/drop-file.ts";
import ensureLineInFile from "../../../lib/ensure-line-in-file.ts";
import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { notImplementedYet } from "../../model/not-implemented-yet.ts";
import { CommandStarted, Progress } from "../../model/progress.ts";
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
    emitProgress(new CommandStarted(this));
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
    emitProgress(new CommandStarted(this));
    const result = ensureLineInFile(this.line)(this.path);
    return {
      stdout: `Line ensured in file ${this.toString()}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}
