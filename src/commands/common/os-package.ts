import { installAptPackage } from "../../../lib/install-apt-packages.ts";
import { Command, CommandResult } from "../../model/command.ts";
import { notImplementedYet } from "../../model/not-implemented-yet.ts";
import { CommandStarted, Progress } from "../../model/progress.ts";

export class OsPackage implements Command {
  readonly type: "OsPackage" = "OsPackage";
  readonly packageName: string;
  readonly cancel = notImplementedYet(this, "cancel");

  constructor(packageName: string) {
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ type: this.type, packageName: this.packageName });
  }

  async run(
    emitProgress: (progress: Progress) => void,
  ): Promise<CommandResult> {
    emitProgress(new CommandStarted(this));
    const result: void = await installAptPackage(this.packageName);
    return {
      stdout: `Installed package ${this.packageName}.`,
      stderr: "",
      all: "",
      status: { success: true, code: 0 },
    };
  }
}
