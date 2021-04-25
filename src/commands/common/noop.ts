import { Command, CommandResult, CommandType } from "../../model/command.ts";

export class Noop implements Command {
  readonly type: CommandType = "Noop";

  async run(): Promise<CommandResult> {
    return {
      stdout: "",
      stderr: "",
      status: { success: true, code: 0 },
    };
  }

  toString() {
    return "Noop";
  }
}

export const NOOP = new Noop();
