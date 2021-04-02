import { Command } from "./command.ts";
import { Enqueued } from "./queue.ts";

export type ProgressType =
  | "StdoutWritten"
  | "StderrWritten"
  | "ChildEnqueued"
  | "CommandStarted";

export interface Progress {
  readonly type: ProgressType;
}

export type Device = "stdout" | "stderr";

export abstract class AbstractStringWritten<T extends Device>
  implements Progress {
  abstract readonly type: ProgressType;
  abstract readonly device: T;
  readonly string: string;
}

export class StdoutWritten extends AbstractStringWritten<"stdout"> {
  readonly type = "StdoutWritten";
  readonly device: "stdout";
  constructor(string: string) {
    super();
    this.string = string;
  }
}

export class StderrWritten extends AbstractStringWritten<"stderr"> {
  readonly type = "StderrWritten";
  readonly device: "stderr";
  constructor(string: string) {
    super();
    this.string = string;
  }
}

export class ChildEnqueued<T extends Command> implements Progress {
  readonly type: "ChildEnqueued";
  readonly enqueued: Enqueued<T>;

  constructor(enqueued: Enqueued<T>) {
    this.enqueued = enqueued;
  }
}

export class CommandStarted<T extends Command> implements Progress {
  readonly type: "CommandStarted";
  readonly command: T;
  constructor(command: T) {
    this.command = command;
  }
}

export const createProgressStream: () => {
  progress: ReadableStream<Progress>;
  outgoingProgresses: Array<Progress>;
} = () => {
  const outgoingProgresses: Array<Progress> = [];
  const pull: ReadableStreamDefaultControllerCallback<Progress> = (
    controller: ReadableStreamDefaultController<Progress>,
  ) => {
    if (outgoingProgresses.length) {
      controller.enqueue(outgoingProgresses.shift());
    }
  };
  const underlyingSource: UnderlyingSource<Progress> = { pull };
  const progress: ReadableStream<Progress> = new ReadableStream<Progress>(
    underlyingSource,
  );
  return { outgoingProgresses, progress };
};
