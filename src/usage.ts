import { availableCommands } from "./commands/index.ts";
import { colorlog } from "./deps.ts";

export async function usageAndExit(
  code: number = 1,
  message?: string,
): Promise<never> {
  if (message) {
    console.error(colorlog.error(message));
  }
  console.error(`
Usage:   sudo ./src/cli.ts <command...>

Usage:   curl https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/manjaro-wip/src/cli.ts \\
         | sudo sh -s <command...>

         Available commands:
${
    availableCommands.map((name) => `            ${name}`)
      .join("\n")
  }

         ...or any valid OS-level package.
  `);
  return Deno.exit(code);
}

export async function errorAndExit(
  code: number = 1,
  message?: string,
): Promise<never> {
  if (message) {
    console.error(colorlog.error(message));
  }
  return Deno.exit(code);
}
