import { colorlog, PasswdEntry } from "../deps.ts";
import { ROOT } from "./user/target-user.ts";

export const ensureSuccessful = async (
  asUser: PasswdEntry,
  cmd: Array<string>,
): Promise<void> => {
  const effectiveCmd = [
    ...(asUser === ROOT
      ? []
      : ["sudo", `--user=${asUser.username}`, "--non-interactive", "--"]),
    ...cmd,
  ];
  console.warn(colorlog.warning(JSON.stringify(effectiveCmd)));

  const process: Deno.Process = await Deno.run({
    stdin: "null",
    // stdout: "piped", // commented out = verbose output while developing
    // stderr: "piped", // commented out = verbose error output while developing
    cmd: effectiveCmd,
  });
  const wasSuccessful = (await process.status()).success;
  return wasSuccessful ? Promise.resolve() : Promise.reject(process);
};

export const symlink = (owner: PasswdEntry, target: string, path: string) =>
  ensureSuccessful(owner, [
    "ln",
    "-s",
    target,
    path,
  ]);

export const ensureSuccessfulStdOut = async (
  cmd: Array<string>,
): Promise<string> => {
  const process: Deno.Process = await Deno.run({
    stdin: "null",
    stdout: "piped",
    // stderr: "piped", // commented out = verbose error output while developing
    cmd,
  });
  const wasSuccessful = (await process.status()).success;
  return wasSuccessful
    ? Promise.resolve(new TextDecoder().decode(await process.output()))
    : Promise.reject(process);
};

export const isSuccessful = async (
  asUser: PasswdEntry,
  cmd: Array<string>,
): Promise<boolean> =>
  ensureSuccessful(asUser, cmd).then(
    () => Promise.resolve(true),
    () => Promise.resolve(false),
  );
