import { NOOP } from "./commands/common/noop.ts";
import { config } from "./config.ts";
import { compose, toposort } from "./deps.ts";
import { Command, CommandResult, CommandType } from "./model/command.ts";
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
  type?: CommandType;
  dependencies?: CommandForLog[];
  locks?: Lock[];
};

const forLog = (depth: number) =>
  (command: Command): CommandForLog => {
    const { type, dependencies, locks } = command;
    return (depth > 0)
      ? {
        type,
        dependencies: dependencies.map(forLog(depth - 1)),
        locks,
      }
      : {
        type,
      };
  };

const stringify = (o: any): string => JSON.stringify(o, null, 2);
const stringifyLine = (o: any): string => JSON.stringify(o);

export const sortCommands = (commands: Command[]): Command[] => {
  const dependencyPairs: [Command, Command][] = commands.flatMap(
    getDependencyPairs,
  );

  const commandsInOrder: Command[] = toposort(dependencyPairs);

  config.verbose && console.log(
    "=====================================================================================\n\ncommands:\n" +
      commands.map(compose(stringify, forLog(1))).join("\n") +
      "\n\n",
  );

  config.verbose && console.log(
    "=====================================================================================\n\dependencyPairs:\n" +
      dependencyPairs.map((pair) => pair.map(compose(stringifyLine, forLog(0))))
        .join("\n") +
      "\n\n",
  );

  config.verbose && console.log(
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
