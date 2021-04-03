import {
  Command,
  CommandResult,
  CommandResultPromiseExecutor,
} from "./command.ts";

import { createProgressStream, Progress } from "./progress.ts";

/**
 * A command in the queue, Promise:ing run and finish.
 */
export class Enqueued<T extends Command> {
  readonly type: "Enqueued" = "Enqueued";
  readonly command: T;
  readonly progress: ReadableStream<Progress>;
  readonly outgoingProgresses: Array<Progress>;
  readonly promise: Promise<CommandResult>;

  constructor(
    command: T,
    commandResultPromise: Promise<CommandResult>,
  ) {
    this.promise = commandResultPromise;
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
  // readonly enqueued: ReadableStream<Enqueued<Command>>;
  // readonly wholeQueue: ReadableStream<Array<Enqueued<Command>>>;

  /**
   * Will run the command immediately.
   * @param command
   */
  enqueue<C extends Command>(command: C): Enqueued<C> {
    const commandResultPromise = command.run(
      (progress: Progress) =>
        setTimeout(() => enqueued.outgoingProgresses.push(progress), 0),
      this,
    );
    const enqueued: Enqueued<C> = new Enqueued<C>(
      command,
      commandResultPromise,
    );

    this.queue.push(enqueued);
    return enqueued;
  }
}
