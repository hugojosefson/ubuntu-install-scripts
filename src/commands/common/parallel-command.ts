import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Queue } from "../../model/queue.ts";

export class ParallelCommand implements Command {
  readonly type: CommandType = "ParallelCommand";
  readonly commands: Array<Command>;

  constructor(commands: Array<Command>) {
    this.commands = commands;
  }

  async run(queue: Queue): Promise<CommandResult> {
    const results = await Promise.all(this.commands.map(
      (command) => queue.enqueue(command).promise,
    ));

    return {
      stdout: results.map((result) => result.stdout).map((s = "") => s.trim())
        .filter((s) => s.length > 0).join("\n"),
      stderr: results.map((result) => result.stderr).map((s = "") => s.trim())
        .filter((s) => s.length > 0).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}
