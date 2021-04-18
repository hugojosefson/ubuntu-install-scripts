import { Command, CommandResult } from "./command.ts";

/**
 * A command in the queue, Promise:ing run and finish.
 */
export class Enqueued<T extends Command> {
  readonly type: "Enqueued" = "Enqueued";
  readonly command: T;
  readonly promise: Promise<CommandResult>;

  constructor(
    command: T,
    commandResultPromise: Promise<CommandResult>,
  ) {
    this.promise = commandResultPromise;
    this.command = command;
  }
}

export class Queue {
  private readonly queue: Array<Enqueued<Command>> = [];

  /**
   * Will run the command immediately.
   * @param command
   */
  enqueue<C extends Command>(command: C): Enqueued<C> {
    const commandResultPromise = command.run(
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
