import { config } from "../config.ts";
import { colorlog, PasswdEntry } from "../deps.ts";
import { CommandResult } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { DBUS_SESSION_BUS_ADDRESS, ROOT } from "./user/target-user.ts";

export type ExecOptions = Pick<Deno.RunOptions, "cwd" | "env"> & {
  verbose?: boolean;
  stdin?: string;
};

export const pipeAndCollect = async (
  from: (Deno.Reader & Deno.Closer) | null | undefined,
  to?: (Deno.Writer & Deno.Closer) | null | false,
  verbose?: boolean,
): Promise<string> => {
  if (!from) throw new Error("Nothing to pipe from!");

  const isVerbose: boolean = typeof verbose === "boolean"
    ? verbose
    : config.VERBOSE;

  const buf: Uint8Array = new Uint8Array(1024);
  let all: Uint8Array = Uint8Array.from([]);
  for (
    let n: number | null = 0;
    typeof n === "number";
    n = await from.read(buf)
  ) {
    if (n > 0) {
      const bytes: Uint8Array = buf.subarray(0, n);
      all = Uint8Array.from([...all, ...bytes]);
      if (isVerbose && to) {
        await to.write(bytes);
      }
    }
  }
  from?.close();
  return new TextDecoder().decode(all);
};

function runOptions(
  asUser: PasswdEntry,
  opts: ExecOptions,
): Pick<Deno.RunOptions, "cwd" | "env"> {
  return {
    ...(opts.cwd ? { cwd: opts.cwd } : {}),
    ...(asUser === ROOT
      ? { ...(opts.env ? { env: opts.env } : {}) }
      : { env: { DBUS_SESSION_BUS_ADDRESS, ...(opts.env || {}) } }),
  };
}

export const ensureSuccessful = async (
  asUser: PasswdEntry,
  cmd: Array<string>,
  options: ExecOptions = {},
): Promise<CommandResult> => {
  const effectiveCmd = [
    ...(asUser === ROOT ? [] : [
      "sudo",
      `--preserve-env=DBUS_SESSION_BUS_ADDRESS,XAUTHORITY,DISPLAY`,
      `--user=${asUser.username}`,
      "--non-interactive",
      "--",
    ]),
    ...cmd,
  ];
  config.VERBOSE && console.error(
    colorlog.warning(
      JSON.stringify({ options, user: asUser.username, cmd, effectiveCmd }),
    ),
  );
  const stdinString = typeof options.stdin === "string" ? options.stdin : "";
  const shouldPipeStdin: boolean = stdinString.length > 0;

  const process: Deno.Process = Deno.run({
    stdin: shouldPipeStdin ? "piped" : "null",
    stdout: "piped",
    stderr: "piped",
    cmd: effectiveCmd,
    ...runOptions(asUser, options),
  });

  if (shouldPipeStdin) {
    const stdinBytes = new TextEncoder().encode(stdinString);
    try {
      await process.stdin?.write(stdinBytes);
    } finally {
      await process.stdin?.close();
    }
  }

  const stdoutPromise = pipeAndCollect(
    process.stdout,
    Deno.stdout,
    options.verbose,
  );
  const stderrPromise = pipeAndCollect(
    process.stderr,
    Deno.stderr,
    options.verbose,
  );
  try {
    const status: Deno.ProcessStatus = await process.status();
    if (status.success) {
      return {
        status,
        stdout: await stdoutPromise,
        stderr: await stderrPromise,
      };
    }
  } catch (e) {
  }
  return Promise.reject({
    status: await process.status(),
    stdout: await stdoutPromise,
    stderr: await stderrPromise,
  });
};

export const symlink = (
  owner: PasswdEntry,
  from: string,
  to: FileSystemPath,
): Promise<CommandResult> =>
  ensureSuccessful(owner, [
    "ln",
    "-s",
    from,
    to.path,
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
