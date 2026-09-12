import { assertEquals, assertRejects } from "@std/assert";
import { apply, execute, InstallFailure } from "../src/runner.ts";

Deno.test("process execution drains both outputs and preserves exit status", async () => {
  const code = await execute([
    "bash",
    "-c",
    "head -c 1048576 /dev/zero; head -c 1048576 /dev/zero >&2; exit 17",
  ], { stdin: "null", stdout: "null", stderr: "null" });
  assertEquals(code, 17);
});
Deno.test("a failed recipe prevents every later recipe from running", async () => {
  const calls: string[][] = [];
  await assertRejects(
    () =>
      apply([
        { name: "first", description: "first", script: "shell.sh" },
        { name: "later", description: "later", script: "shell.sh" },
      ], (args) => {
        calls.push(args);
        return Promise.resolve(17);
      }),
    InstallFailure,
    "first failed (exit 17)",
  );
  assertEquals(calls.length, 1);
});
