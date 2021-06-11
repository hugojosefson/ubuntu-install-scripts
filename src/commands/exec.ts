import { PasswdEntry } from "../deps.ts";
import { Command, CommandResult, RunResult } from "../model/command.ts";
import { Lock } from "../model/dependency.ts";
import { ensureSuccessful, ExecOptions } from "../os/exec.ts";

export class Exec extends Command {
  private readonly asUser: PasswdEntry;
  private readonly cmd: Array<string>;
  private readonly options?: ExecOptions;

  constructor(
    dependencies: Array<Command>,
    locks: Array<Lock>,
    asUser: PasswdEntry,
    options: ExecOptions = {},
    cmd: Array<string>,
  ) {
    super();
    this.asUser = asUser;
    this.cmd = cmd;
    this.options = options;
    this.dependencies.push(...dependencies);
    this.locks.push(...locks);
  }

  run(): Promise<RunResult> {
    return ensureSuccessful(
      this.asUser,
      this.cmd,
      this.options,
    );
  }

  static sequentialExec(
    asUser: PasswdEntry,
    options: ExecOptions,
    cmds: Array<Array<string>>,
  ): Command {
    return (new Command())
      .withRun(async () => {
        const results: Array<CommandResult> = [];
        for (const cmd of cmds) {
          results.push(await ensureSuccessful(asUser, cmd, options));
        }

        const success: boolean = results
          .map((result) => result.status.success)
          .reduce((acc, curr) => acc && curr, true);

        const stdout: string = results
          .map(({ stdout }) => stdout.trim())
          .filter((s) => s.length > 0)
          .join("\n");

        const stderr: string = results
          .map(({ stderr }) => stderr.trim())
          .filter((s) => s.length > 0)
          .join("\n");

        const result: CommandResult = {
          stdout,
          stderr,
          status: success ? { success, code: 0 } : { success, code: 1 },
        };
        return result;
      });
  }
}
