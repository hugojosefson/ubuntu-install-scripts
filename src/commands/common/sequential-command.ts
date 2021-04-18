import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Enqueued, Queue } from "../../model/queue.ts";

export class SequentialCommand implements Command {
  readonly type: CommandType = "SequentialCommand";
  readonly commands: Array<Command>;

  constructor(commands: Array<Command>) {
    this.commands = commands;
  }

  async run(queue: Queue): Promise<CommandResult> {
    const commandsEnqueued: Array<Promise<CommandResult>> = this.commands.map(
      async (command) => {
        const commandEnqueued: Enqueued<Command> = queue.enqueue(command);
        const result = await commandEnqueued.promise;
        return result;
      },
    );

    const results = await Promise.all(commandsEnqueued);
    return {
      stdout: results.map((result) => result.stdout).join("\n"),
      stderr: results.map((result) => result.stderr).join("\n"),
      all: results.map((result) => result.all).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}
