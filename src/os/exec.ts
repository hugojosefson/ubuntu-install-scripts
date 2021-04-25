import { colorlog, PasswdEntry } from "../deps.ts";
import { CommandResult } from "../model/command.ts";
import { ROOT } from "./user/target-user.ts";

export type ExecOptions = Pick<
  Deno.RunOptions,
  "cwd" | "env" | "stdout" | "stderr"
>;

export const ensureSuccessful = async (
  asUser: PasswdEntry,
  cmd: Array<string>,
  options: ExecOptions = {},
): Promise<CommandResult> => {
  const effectiveCmd = [
    ...(asUser === ROOT
      ? []
      : ["sudo", `--user=${asUser.username}`, "--non-interactive", "--"]),
    ...cmd,
  ];
  console.error(
    colorlog.warning(
      JSON.stringify({ options, user: asUser.username, cmd, effectiveCmd }),
    ),
  );
  const process: Deno.Process = Deno.run({
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
    cmd: effectiveCmd,
    ...options,
  });
  try {
    const status: Deno.ProcessStatus = await process.status();
    if (status.success) {
      return {
        status,
        stdout: new TextDecoder().decode(await process.output()),
        stderr: new TextDecoder().decode(await process.stderrOutput()),
      };
    }
  } catch (e) {
  }
  return Promise.reject({
    status: await process.status(),
  });
};

export const symlink = (
  owner: PasswdEntry,
  target: string,
  path: string,
): Promise<CommandResult> =>
  ensureSuccessful(owner, [
    "ln",
    "-s",
    target,
    path,
  ]);

export const ensureSuccessfulStdOut = async (
  asUser: PasswdEntry,
  cmd: Array<string>,
  options: ExecOptions = {},
): Promise<string> =>
  (await ensureSuccessful(asUser, cmd, options)).stdout.trim();

export const isSuccessful = async (
  asUser: PasswdEntry,
  cmd: Array<string>,
  options: ExecOptions = {},
): Promise<boolean> =>
  ensureSuccessful(asUser, cmd, options).then(
    () => Promise.resolve(true),
    () => Promise.resolve(false),
  );
