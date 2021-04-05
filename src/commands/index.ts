import { Command } from "../model/command.ts";
import { OsPackage } from "./common/os-package.ts";
import { vim } from "./vim.ts";
import { gitk } from "./gitk.ts";

const commands: Record<string, Command> = {
  gitk,
  vim,
  awscli: new OsPackage("aws-cli"),
  libreoffice: OsPackage.multi([
    "libreoffice-fresh",
    "libreoffice-fresh-en-gb",
    "libreoffice-fresh-sv",
  ]),
};

export const getCommand = (name: string): Command =>
  commands[name] || new OsPackage(name);

export const availableCommands: Array<string> = Object.keys(commands);
