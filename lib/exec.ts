export const withOutput = async (
  cmd: Array<string>,
): Promise<{ status: Deno.ProcessStatus; stdout: string; stderr: string }> => {
  const process: Deno.Process = await Deno.run({
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
    cmd,
  });
  return {
    status: await process.status(),
    stdout: new TextDecoder().decode(await process.output()),
    stderr: new TextDecoder().decode(await process.stderrOutput()),
  };
};

export const ensureSuccessful = async (
  cmd: Array<string>,
): Promise<void> => {
  const process: Deno.Process = await Deno.run({
    stdin: "null",
    // stdout: "piped", // verbose output while developing
    // stderr: "piped", // verbose error output while developing
    cmd,
  });
  const wasSuccessful = (await process.status()).success;
  return wasSuccessful ? Promise.resolve() : Promise.reject(process);
};

export const isSuccessful = async (cmd: Array<string>): Promise<boolean> =>
  ensureSuccessful(cmd).then(
    () => Promise.resolve(true),
    () => Promise.resolve(false),
  );
