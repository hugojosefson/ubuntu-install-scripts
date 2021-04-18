import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Enqueued, Queue } from "../../model/queue.ts";

export class SequentialCommand implements Command {
  readonly type: CommandType = "SequentialCommand";
  readonly commands: Array<Command>;

  constructor(commands: Array<Command>) {
    this.commands = commands;
  }

  async run(queue: Queue): Promise<CommandResult> {
    const results: Array<CommandResult> = [];
    for (const command of this.commands) {
      const commandEnqueued: Enqueued<Command> = queue.enqueue(command);
      const commandResult: CommandResult = await commandEnqueued.promise;
      results.push(commandResult);
    }

    return {
      stdout: results.map((result) => result.stdout).join("\n"),
      stderr: results.map((result) => result.stderr).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}
