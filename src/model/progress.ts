import { Command } from "./command.ts";
import { Enqueued } from "./queue.ts";

export type ProgressType =
  | "StdoutWritten"
  | "StderrWritten"
  | "ChildEnqueued"
  | "Started";

export interface Progress {
  readonly command: Command;
  readonly type: ProgressType;
}

abstract class AbstractProgress implements Progress {
  readonly command: Command;
  readonly type: ProgressType;

  protected constructor(command: Command, type: ProgressType) {
    this.command = command;
    this.type = type;
  }
}

export type Device = "stdout" | "stderr";

export abstract class AbstractStringWritten<T extends Device>
  extends AbstractProgress {
  abstract readonly device: T;
  readonly string: string;

  protected constructor(command: Command, type: ProgressType, string: string) {
    super(command, type);
    this.string = string;
  }
}

export class StdoutWritten extends AbstractStringWritten<"stdout"> {
  readonly device: "stdout" = "stdout";

  constructor(command: Command, string: string) {
    super(command, "StdoutWritten", string);
  }
}

export class StderrWritten extends AbstractStringWritten<"stderr"> {
  readonly device: "stderr" = "stderr";

  constructor(command: Command, string: string) {
    super(command, "StderrWritten", string);
  }
}
export class ChildEnqueued<C extends Command> extends AbstractProgress {
  readonly enqueued: Enqueued<C>;

  constructor(command: Command, enqueued: Enqueued<C>) {
    super(command, "ChildEnqueued");
    this.enqueued = enqueued;
  }
}

export class Started<T extends Command> extends AbstractProgress {
  constructor(command: T) {
    super(command, "Started");
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
