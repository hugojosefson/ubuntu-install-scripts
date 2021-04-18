import { availableCommands } from "./commands/index.ts";
import { colorlog } from "./deps.ts";

export const usageAndExit = async (
  code: number = 1,
  message?: string,
): Promise<never> => {
  if (message) {
    console.error(colorlog.error(message));
  }
  console.error(`
Usage:   sudo ./cli.ts <command...>

         Available commands:
${
    availableCommands.map((name) => `            ${name}`)
      .join("\n")
  }

         ...or any valid OS-level package.
  `);
  Deno.exit(code);
  throw new Error(); // not really, because we already exited, but just to appease the compiler about "never" returning.
};
