import { error } from "https://deno.land/x/colorlog/mod.ts";
import { availableCommands } from "./commands/index.ts";

export const usageAndExit = (code: number = 1, message?: string): never => {
  if (message) {
    console.error(error(message));
  }
  console.error(`
Usage:   ./run.ts <command...>

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
