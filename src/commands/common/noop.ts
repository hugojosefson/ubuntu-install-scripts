import { Command } from "../../model/command.ts";
import { DependencyId } from "../../model/dependency.ts";

export const NOOP = Command.of("Noop", new DependencyId("Noop"));
