import { Command } from "../model/command.ts";
import { OsPackage } from "./common/os-package.ts";
import { gitk } from "./gitk.ts";

const commands: Record<string, Command> = {
  gitk,
  awscli: new OsPackage("aws-cli"),
};

export const getCommand = (name: string): Command =>
  commands[name] || new OsPackage(name);

export const availableCommands: Array<string> = Object.keys(commands);
