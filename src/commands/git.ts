import { Command } from "../model/command.ts";
import { bashAliases } from "./bash-aliases.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { gitCompletion } from "./git-completion.ts";

export const git = Command.custom().withDependencies([
  InstallOsPackage.of("git"),
  bashAliases,
  gitCompletion,
]);
