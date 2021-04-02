import { Command } from "./command.ts";

export const notImplementedYet = function (context: Command, method: string) {
  return () =>
    Promise.reject(new Error(`${context.type}.${method} not implemented yet.`));
};
