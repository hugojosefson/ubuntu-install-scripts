import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { Queue } from "../../model/queue.ts";

export class SequentialCommand implements Command {
  readonly type: CommandType = "SequentialCommand";
  readonly commands: Array<Command>;

  constructor(commands: Array<Command>) {
    this.commands = commands;
  }

  async run(queue: Queue): Promise<CommandResult> {
    const results: Array<CommandResult> = [];
    for (const command of this.commands) {
      results.push(await queue.enqueue(command).promise);
    }

    return {
      stdout: results.map((result) => result.stdout).map((s = "") => s.trim())
        .filter((s) => s.length > 0).join("\n"),
      stderr: results.map((result) => result.stderr).map((s = "") => s.trim())
        .filter((s) => s.length > 0).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}
