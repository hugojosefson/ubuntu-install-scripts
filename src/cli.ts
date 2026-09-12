#!/usr/bin/env -S deno run --frozen --allow-read --allow-env --allow-run
import { parseArgs } from "@std/cli/parse-args";
import { catalog } from "./catalog.ts";
import { plan, validatePlatform } from "./plan.ts";
import { apply, InstallFailure } from "./runner.ts";

export async function main(args: string[]): Promise<void> {
  const flags = parseArgs(args, {
    boolean: ["help", "json", "apply"],
    alias: { h: "help" },
    unknown: (arg) => {
      if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
      return true;
    },
  });
  const words = flags._.map(String);
  if (flags.help || words.length === 0) {
    console.log(
      `Ubuntu 26.04 workstation setup\n\nUsage:\n  ./install list\n  ./install plan base firefox [--json]\n  ./install apply base firefox\n  ./install base firefox --apply\n\nWithout apply, recipes are only listed in execution order.\nRun as your normal user; system steps request sudo.\nUse ./test/check for checks in Docker.`,
    );
    return;
  }
  if (words[0] === "list") {
    if (words.length > 1 || flags.apply) {
      throw new Error("list does not accept recipes or --apply");
    }
    console.log(
      flags.json
        ? JSON.stringify(catalog, null, 2)
        : Object.entries(catalog).map(([name, recipe]) =>
          `${name.padEnd(24)} ${recipe.description}`
        ).join("\n"),
    );
    return;
  }
  const mode = ["plan", "apply"].includes(words[0]) ? words.shift() : undefined;
  if (!words.length) {
    throw new Error("Select at least one recipe; use 'list' for choices.");
  }
  if (mode === "plan" && flags.apply) {
    throw new Error("plan cannot be combined with --apply");
  }
  const shouldApply = mode === "apply" || flags.apply;
  if (shouldApply && flags.json) {
    throw new Error("--json is only available for list and plan");
  }
  const selected = plan(words);
  console.log(
    flags.json
      ? JSON.stringify(selected, null, 2)
      : selected.map((recipe) =>
        `${recipe.name.padEnd(24)} ${recipe.description}`
      ).join("\n"),
  );
  if (shouldApply) {
    validatePlatform(
      await Deno.readTextFile("/etc/os-release"),
      Deno.build.arch,
      selected,
    );
    await apply(selected);
  }
}

if (import.meta.main) {
  try {
    await main(Deno.args);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exitCode = error instanceof InstallFailure ? error.code : 1;
  }
}
