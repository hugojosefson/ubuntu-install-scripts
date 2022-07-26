import { availableCommands } from "./commands/index.ts";
import { colorlog } from "./deps.ts";

export function usageAndExit(
  code = 1,
  message?: string,
): never {
  if (message) {
    console.error(colorlog.error(message));
  }
  console.error(`
Usage, if you only have curl, unzip and sh:

         curl -fsSL https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/ubuntu-22.04/src/cli.ts \\
         | sudo sh -s <command...>


Usage, if you have deno:

         sudo deno -A --unstable https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/ubuntu-22.04/src/cli.ts \\
         <command...>


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

export function errorAndExit(
  code = 1,
  message?: string,
): never {
  if (message) {
    console.error(colorlog.error(message));
  }
  return Deno.exit(code);
}
