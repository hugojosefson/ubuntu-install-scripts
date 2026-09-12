import { assertEquals, assertStringIncludes } from "@std/assert";

async function cli(...args: string[]) {
  const result = await new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--frozen",
      "--allow-read",
      "--allow-env",
      "src/cli.ts",
      ...args,
    ],
    stdout: "piped",
    stderr: "piped",
    env: { DENO_NO_PROMPT: "1" },
  }).output();
  return {
    code: result.code,
    stdout: new TextDecoder().decode(result.stdout),
    stderr: new TextDecoder().decode(result.stderr),
  };
}
Deno.test("help and plan need no root, subprocess, network, or write permission", async () => {
  assertEquals((await cli("--help")).code, 0);
  const result = await cli("plan", "firefox", "--json");
  assertEquals(result.code, 0);
  assertEquals(
    JSON.parse(result.stdout).map((recipe: { name: string }) => recipe.name),
    ["bootstrap", "firefox"],
  );
});
Deno.test("CLI rejects unknown flags, typos, and ambiguous apply requests", async () => {
  for (
    const args of [["--bogus"], ["plan"], ["plan", "firefox", "--apply"], [
      "apply",
      "firefox",
      "--json",
    ], ["firfox"]]
  ) {
    assertEquals((await cli(...args)).code, 1);
  }
  assertStringIncludes((await cli("firfox")).stderr, "Unknown recipe");
});
