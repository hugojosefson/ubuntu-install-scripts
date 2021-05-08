import { Command } from "../../model/command.ts";

export const NOOP = () => Command.of("Noop");
