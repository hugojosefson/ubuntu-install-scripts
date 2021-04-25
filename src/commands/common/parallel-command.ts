import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Queue } from "../../model/queue.ts";

export class ParallelCommand implements Command {
  readonly type: CommandType = "ParallelCommand";
  readonly commands: Array<Command>;

  constructor(commands: Array<Command>) {
    this.commands = commands;
  }

  async run(queue: Queue): Promise<CommandResult> {
    const commandsEnqueued: Array<Promise<CommandResult>> = this.commands.map(
      (command) => queue.enqueue(command).promise,
    );

    const results = await Promise.all(commandsEnqueued);
    return {
      stdout: results.map((result) => result.stdout).join("\n"),
      stderr: results.map((result) => result.stderr).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}
