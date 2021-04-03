import { Command } from "../model/command.ts";
import { OsPackage } from "./common/os-package.ts";

export const awscli: Command = new OsPackage("aws-cli");
export const brave: Command = new OsPackage("brave");
export { gitk } from "./gitk.ts";
