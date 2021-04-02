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

  constructor(string: string) {
    this.string = string;
  }
}

export class StdoutWritten extends AbstractStringWritten<"stdout"> {
  readonly type = "StdoutWritten";
  readonly device: "stdout" = "stdout";
}

export class StderrWritten extends AbstractStringWritten<"stderr"> {
  readonly type = "StderrWritten";
  readonly device: "stderr" = "stderr";
}

export class ChildEnqueued<C extends Command> implements Progress {
  readonly type: "ChildEnqueued" = "ChildEnqueued";
  readonly enqueued: Enqueued<C>;

  constructor(enqueued: Enqueued<C>) {
    this.enqueued = enqueued;
  }
}

export class CommandStarted<T extends Command> implements Progress {
  readonly type: "CommandStarted" = "CommandStarted";
  readonly command: T;
  constructor(command: T) {
    this.command = command;
  }
}

const isUndefined = <T>(t: T | undefined): t is undefined =>
  typeof t === "undefined";

export const createProgressStream: () => {
  progress: ReadableStream<Progress>;
  outgoingProgresses: Array<Progress>;
} = () => {
  const outgoingProgresses: Array<Progress> = [];
  const pull: ReadableStreamDefaultControllerCallback<Progress> = (
    controller: ReadableStreamDefaultController<Progress>,
  ) => {
    const chunk: Progress | undefined = outgoingProgresses.shift();
    if (isUndefined(chunk)) {
      return;
    }
    controller.enqueue(chunk);
  };
  const underlyingSource: UnderlyingSource<Progress> = { pull };
  const progress: ReadableStream<Progress> = new ReadableStream<Progress>(
    underlyingSource,
  );
  return { outgoingProgresses, progress };
};
