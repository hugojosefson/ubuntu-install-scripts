import { Command } from "../model/command.ts";
import { OsPackage } from "./common/os-package.ts";
import { gitk } from "./gitk.ts";

export type CommandName =
  | "gitk"
  | "awscli"
  | "brave";

export const availableCommands: Record<CommandName, Command> = {
  gitk,
  awscli: new OsPackage("aws-cli"),
  brave: new OsPackage("brave"),
};
