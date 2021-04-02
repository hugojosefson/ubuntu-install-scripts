import dropFile from "../../lib/drop-file.ts";
import ensureLineInFile from "../../lib/ensure-line-in-file.ts";
import { installAptPackage } from "../../lib/install-apt-packages";
import { notImplementedYet } from "./not-implemented-yet.ts";
import { CommandStarted, Progress } from "./progress.ts";
import { Enqueued, Queue } from "./queue.ts";

export interface CommandResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
  all: string;
}

export type CommandResultPromiseExecutor = (
  resolve: (commandResult: CommandResult | PromiseLike<CommandResult>) => void,
  reject: (reason: CommandResult) => void,
) => void;

export type CommandType =
  | "OsPackage"
  | "DropFile"
  | "LineInFile"
  | "ParallelCommand";

export interface Command {
  readonly type: CommandType;
  readonly run: (
    emitProgress: (progress: Progress) => void,
    queue: Queue,
  ) => CommandResultPromiseExecutor;
  readonly cancel: () => Promise<void>;
  readonly toString: () => string;
}

export class ParallelCommand implements Command {
  readonly type: CommandType = "ParallelCommand";
  readonly commands: Array<Command>;
  constructor(...commands: Array<Command>) {
    this.commands = commands;
  }

  async cancel(): Promise<void> {
    const cancellations: Promise<void>[] = this.commands.map((command) =>
      command.cancel()
    );
    await Promise.all(cancellations);
  }

  run(
    emitProgress: (progress: Progress) => void,
    queue: Queue,
  ): CommandResultPromiseExecutor {
    const commandsEnqueued: Promise<void>[] = this.commands.map(
      async (command) => {
        const commandEnqueued: Enqueued<Command> = queue.enqueue(command);
        emitProgress(new CommandStarted(command));
        await commandEnqueued;
      },
    );
    return (resolve, reject) => {
      emitProgress(new CommandStarted(this));
      Promise.all(commandsEnqueued).then(() => {
        resolve({
          stdout: "",
          stderr: "",
          all: "",
          status: { success: true, code: 0 },
        });
      }, reject);
    };
  }
}

export class OsPackage implements Command {
  readonly type: "OsPackage";
  readonly packageName: string;
  readonly cancel = notImplementedYet("cancel");

  constructor(packageName: string) {
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  run(
    emitProgress: (progress: Progress) => void,
  ): CommandResultPromiseExecutor {
    return (resolve, reject) => {
      emitProgress(new CommandStarted(this));
      installAptPackage(this.packageName).then(() => {
        resolve({
          stdout: "",
          stderr: "",
          all: "",
          status: { success: true, code: 0 },
        });
      }, reject);
    };
  }
}

export abstract class AbstractFileCommand implements Command {
  abstract readonly type: CommandType;

  readonly path: string;
  readonly mode?: number;
  readonly cancel = notImplementedYet("cancel");

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
  ): CommandResultPromiseExecutor;
}

export class DropFile extends AbstractFileCommand {
  readonly type: "DropFile";
  readonly contents: string;

  constructor(path: string, contents: string, mode?: number) {
    super(path, mode);
    this.contents = contents;
  }

  run(
    emitProgress: (progress: Progress) => void,
  ): CommandResultPromiseExecutor {
    return (resolve, reject) => {
      emitProgress(new CommandStarted(this));
      dropFile(this.mode)(this.contents)(this.path).then(() => {
        resolve({
          stdout: "",
          stderr: "",
          all: "",
          status: { success: true, code: 0 },
        });
      }, reject);
    };
  }
}

export class DropExecutable extends DropFile {
  constructor(path: string, contents: string) {
    super(path, contents, 0o775);
  }
}
export class LineInFile extends AbstractFileCommand {
  readonly type: "LineInFile";
  readonly line: string;

  constructor(path: string, line: string) {
    super(path);
    this.line = line;
  }
  run(
    emitProgress: (progress: Progress) => void,
  ): CommandResultPromiseExecutor {
    return (resolve, reject) => {
      emitProgress(new CommandStarted(this));
      ensureLineInFile(this.line)(this.path).then(() => {
        resolve({
          stdout: "",
          stderr: "",
          all: "",
          status: { success: true, code: 0 },
        });
      }, reject);
    };
  }
}
