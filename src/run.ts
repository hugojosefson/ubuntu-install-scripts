import { NOOP } from "./commands/common/noop.ts";
import { config } from "./config.ts";
import { compose, toposort } from "./deps.ts";
import { Command, CommandResult } from "./model/command.ts";
import { Lock } from "./model/dependency.ts";

function getDependencyPairs(command: Command): Array<[Command, Command]> {
  if (command.dependencies.length === 0) {
    return [[NOOP(), command]];
  }
  const thisCommandDependsOnItsDependencies: Array<[Command, Command]> = command
    .dependencies
    .map((
      dep,
    ) => [dep, command]);

  const dependenciesDependOnTheirDependencies: Array<[Command, Command]> =
    command.dependencies.flatMap((dep) => getDependencyPairs(dep));

  return [
    ...thisCommandDependsOnItsDependencies,
    ...dependenciesDependOnTheirDependencies,
  ];
}

type CommandForLog = {
  dependencies?: CommandForLog[];
  locks?: Lock[];
};

const forLog = (depth: number) =>
  (command: Command): CommandForLog => {
    const { dependencies, locks } = command;
    return (depth > 0)
      ? {
        dependencies: dependencies.map(forLog(depth - 1)),
        locks,
      }
      : {};
  };

// deno-lint-ignore no-explicit-any
const stringify = (o?: any): string => JSON.stringify(o, null, 2);
// deno-lint-ignore no-explicit-any
const stringifyLine = (o: any): string => JSON.stringify(o);

export const sortCommands = (commands: Command[]): Command[] => {
  const dependencyPairs: [Command, Command][] = commands.flatMap(
    getDependencyPairs,
  );

  const commandsInOrder: Command[] = toposort(dependencyPairs);

  config.VERBOSE && console.error(
    "=====================================================================================\n\ncommands:\n" +
      commands.map(compose(stringify, forLog(1))).join("\n") +
      "\n\n",
  );

  config.VERBOSE && console.error(
    "=====================================================================================\n\dependencyPairs:\n" +
      dependencyPairs.map((pair) => pair.map(compose(stringifyLine, forLog(0))))
        .join("\n") +
      "\n\n",
  );

  config.VERBOSE && console.error(
    "=====================================================================================\n\commandsInOrder:\n" +
      commandsInOrder.map(
        compose(
          stringifyLine,
          (c: CommandForLog) => {
            delete c.dependencies;
            return c;
          },
          forLog(1),
        ),
      ).join("\n") +
      "\n\n",
  );
  return commandsInOrder;
};

export async function run(commands: Command[]): Promise<CommandResult[]> {
  const sortedCommands: Command[] = sortCommands(commands);

  const commandResults: CommandResult[] = [];
  for (const command of sortedCommands) {
    commandResults.push(await command.runWhenDependenciesAreDone());
  }

  return commandResults;
}
