export async function isRunningAsRoot(): Promise<boolean> {
  const runOptions: Deno.RunOptions = {
    cmd: ["bash", "-c", "echo $EUID"],
    stdout: "piped",
  };
  const outputBytes: Uint8Array = await Deno.run(runOptions).output();
  const outputString = new TextDecoder().decode(outputBytes);
  return outputString.trim() === "0";
}
