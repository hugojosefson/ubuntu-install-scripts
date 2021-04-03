import dropFile from "../../lib/drop-file.ts";
import ensureLineInFile from "../../lib/ensure-line-in-file.ts";
import { installAptPackage } from "../../lib/install-apt-packages.ts";
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
  ) => Promise<CommandResult>;
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

  async run(
    emitProgress: (progress: Progress) => void,
    queue: Queue,
  ): Promise<CommandResult> {
    const commandsEnqueued: Array<Promise<CommandResult>> = this.commands.map(
      async (command) => {
        const commandEnqueued: Enqueued<Command> = queue.enqueue(command);
        emitProgress(new CommandStarted(command));
        return commandEnqueued.promise;
      },
    );

    emitProgress(new CommandStarted(this));
    const results = await Promise.all(commandsEnqueued);
    return {
      stdout: results.map((result) => result.stdout).join("\n"),
      stderr: results.map((result) => result.stderr).join("\n"),
      all: results.map((result) => result.all).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}

export class OsPackage implements Command {
  readonly type: "OsPackage" = "OsPackage";
  readonly packageName: string;
  readonly cancel = notImplementedYet(this, "cancel");

  constructor(packageName: string) {
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(
    emitProgress: (progress: Progress) => void,
  ): Promise<CommandResult> {
    emitProgress(new CommandStarted(this));
    const result: void = await installAptPackage(this.packageName);
    return {
      stdout: `Installed package ${this.packageName}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}

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
