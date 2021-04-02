import {
  Command,
  CommandResult,
  CommandResultPromiseExecutor,
} from "./command.ts";

import { createProgressStream, Progress } from "./progress.ts";

/**
 * A command in the queue, Promise:ing run and finish.
 */
export class Enqueued<T extends Command> extends Promise<CommandResult> {
  readonly type: "Enqueued";
  readonly command: T;
  readonly progress: ReadableStream<Progress>;
  readonly outgoingProgresses: Array<Progress>;

  constructor(
    command: T,
    commandResultPromiseExecutor: CommandResultPromiseExecutor,
  ) {
    super(commandResultPromiseExecutor);
    const { progress, outgoingProgresses } = createProgressStream();
    this.progress = progress;
    this.outgoingProgresses = outgoingProgresses;
    this.command = command;
  }

  cancel(): Promise<void> {
    return this.command.cancel();
  }
}

export class Queue {
  private readonly queue: Array<Enqueued<Command>> = [];
  readonly enqueued: ReadableStream<Enqueued<Command>>;
  readonly wholeQueue: ReadableStream<Array<Enqueued<Command>>>;

  /**
   * Will run the command immediately.
   * @param command
   */
  enqueue<T>(command: T): Enqueued<T> {
    const enqueued = new Enqueued(
      command,
      command.run(this, (progress: Progress) => {
        enqueued.outgoingProgresses.push(progress);
      }),
    );
    this.queue.push(enqueued);
    return enqueued;
  }
}
