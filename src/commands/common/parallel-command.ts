import { Command, CommandResult, CommandType } from "../../model/command.ts";
import { CommandStarted, Progress } from "../../model/progress.ts";
import { Enqueued, Queue } from "../../model/queue.ts";

export class ParallelCommand implements Command {
  readonly type: CommandType = "ParallelCommand";
  readonly commands: Array<Command>;

  constructor(commands: Array<Command>) {
    this.commands = commands;
  }

  async cancel(): Promise<void> {
    const cancellations: Promise<void>[] = this.commands.map((command) =>
      command.cancel()
    );
    await Promise.all(cancellations);
  }

  async run(
    emitProgress: (progress: Progress) => void,
    queue: Queue,
  ): Promise<CommandResult> {
    const commandsEnqueued: Array<Promise<CommandResult>> = this.commands.map(
      async (command) => {
        const commandEnqueued: Enqueued<Command> = queue.enqueue(command);
        emitProgress(new CommandStarted(command));
        return commandEnqueued.promise;
      },
    );

    emitProgress(new CommandStarted(this));
    const results = await Promise.all(commandsEnqueued);
    return {
      stdout: results.map((result) => result.stdout).join("\n"),
      stderr: results.map((result) => result.stderr).join("\n"),
      all: results.map((result) => result.all).join("\n"),
      status: { success: true, code: 0 },
    };
  }
}
