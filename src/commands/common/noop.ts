import { AbstractCommand, CommandResult } from "../../model/command.ts";
import { DependencyId } from "../../model/dependency.ts";

export class Noop extends AbstractCommand {
  private constructor() {
    super("Noop", new DependencyId("Noop", "NOOP"));
  }
  run(): Promise<CommandResult> {
    if (this.doneDeferred.isDone) {
      return this.done;
    }

    return this.resolve({
      stdout: "",
      stderr: "",
      status: { success: true, code: 0 },
    });
  }
  static NOOP = new Noop();
}
