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
Usage, if you only have curl, unzip and sh:

         curl -fsSL https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/manjaro-wip/src/cli.ts \\
         | sudo sh -s <command...>


Usage, if you have deno:

         sudo deno -A --unstable https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/manjaro-wip/src/cli.ts <command...>


Usage, if you have deno, and have cloned this git repo:

         sudo deno -A --unstable ./src/cli.ts <command...>


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
