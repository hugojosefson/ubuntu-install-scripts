import { NOOP } from "./commands/common/noop.ts";
import { getCommand } from "./commands/index.ts";
import { compose, toposort } from "./deps.ts";
import { Command, CommandResult, CommandType } from "./model/command.ts";
import { DependencyId, Lock } from "./model/dependency.ts";

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
    command.dependencies.flatMap((
      dep,
    ) => getDependencyPairs(dep));

  return [
    ...thisCommandDependsOnItsDependencies,
    ...dependenciesDependOnTheirDependencies,
  ];
}

type CommandForLog = {
  type?: CommandType;
  id?: DependencyId;
  dependencies?: Array<CommandForLog>;
  locks?: Array<Lock>;
};

const forLog = (depth: number) =>
  (command: Command): CommandForLog => {
    const { type, id, dependencies, locks } = command;
    return (depth > 0)
      ? {
        type,
        id,
        dependencies: dependencies.map(forLog(depth - 1)),
        locks,
      }
      : {
        type,
        id,
      };
  };

const stringify = (o: any): string => JSON.stringify(o, null, 2);
const stringifyLine = (o: any): string => JSON.stringify(o);

export const run = async (
  commandStrings: Array<string>,
): Promise<Array<CommandResult>> => {
  const commands: Array<Command> = await Promise.all(
    commandStrings.map(getCommand),
  );

  const dependencyPairs: Array<[Command, Command]> = commands.flatMap(
    getDependencyPairs,
  );

  const commandsInOrder: Array<Command> = toposort(dependencyPairs);

  console.log(
    "=====================================================================================\n\ncommands:\n" +
      commands.map(compose(stringify, forLog(1))).join("\n") +
      "\n\n",
  );

  console.log(
    "=====================================================================================\n\dependencyPairs:\n" +
      dependencyPairs.map((pair) => pair.map(compose(stringifyLine, forLog(0))))
        .join("\n") +
      "\n\n",
  );

  console.log(
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

  const commandResults: Array<CommandResult> = [];
  for (const command of commandsInOrder) {
    console.log(`Running command `, command);
    commandResults.push(await command.runWhenDependenciesAreDone());
    console.log(`Running command `, command, "DONE.");
  }

  return commandResults;
};
