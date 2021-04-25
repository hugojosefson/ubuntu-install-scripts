import { getCommand } from "./commands/index.ts";
import { Command, CommandResult } from "./model/command.ts";
import { Enqueued, Queue } from "./model/queue.ts";

export const run = async (
  commandStrings: Array<string>,
): Promise<Array<CommandResult>> => {
  const queue = new Queue();

  const enqueuedCommands: Array<Enqueued<Command>> = await Promise.all(
    commandStrings
      .map(getCommand)
      .map((command) => queue.enqueue(command)),
  );

  return await Promise.all(
    enqueuedCommands.map((enqueued: Enqueued<Command>) => enqueued.promise),
  );
};
