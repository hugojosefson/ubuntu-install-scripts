import { PasswdEntry } from "../../deps.ts";

export function sudoKeepalive(asUser: PasswdEntry): () => void {
  const process: Deno.Process = Deno.run({
    cmd: [
      "sh",
      "-c",
      `while true; do sudo --user="${asUser.username}" sudo -v; sleep 10; done;`,
    ],
    stdin: "null",
    stdout: "null",
    stderr: "null",
  });
  return () => process.kill(Deno.Signal.SIGTERM);
}
