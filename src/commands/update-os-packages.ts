import { ensureSuccessful } from "../../lib/exec.ts";
import { Command, CommandResult } from "../model/command.ts";
import { notImplementedYet } from "../model/not-implemented-yet.ts";
import { Progress, Started } from "../model/progress.ts";

export class UpdateOsPackages implements Command {
  readonly type: "UpdateOsPackages" = "UpdateOsPackages";
  readonly cancel = notImplementedYet(this, "cancel");

  toString() {
    return JSON.stringify({ type: this.type });
  }

  async run(
    emitProgress: (progress: Progress) => void,
  ): Promise<CommandResult> {
    emitProgress(new Started(this));
    const result: void = await ensureSuccessful([
      "pacman",
      "-Syu",
      "--noconfirm",
    ]);
    return {
      stdout: `Updated OS packages.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}
