import { NOOP } from "./commands/common/noop.ts";
import { getCommand } from "./commands/index.ts";
import { toposort } from "./deps.ts";
import { Command, CommandResult } from "./model/command.ts";

function getDependencyPairs(command: Command): Array<[Command, Command]> {
  if (command.dependencies.length === 0) {
    return [[NOOP, command]];
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
    JSON.stringify(
      {
        commands,
        dependencyPairs,
        commandsInOrder: commandsInOrder.map(({ type, id }) => ({
          type,
          id,
        })),
      },
      null,
      2,
    ),
  );
  const commandResults: Array<CommandResult> = await Promise.all(
    commandsInOrder.map((command: Command) =>
      command.runWhenDependenciesAreDone()
    ),
  );
  return commandResults;
};
