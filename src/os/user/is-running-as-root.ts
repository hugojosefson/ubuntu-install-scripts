export const isRunningAsRoot = async (): Promise<boolean> =>
  (new TextDecoder()).decode(
    await Deno.run({ cmd: ["bash", "-c", "echo $EUID"], stdout: "piped" })
      .output(),
  ).trim() === "0";
