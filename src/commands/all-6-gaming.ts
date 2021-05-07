import { Command } from "../model/command.ts";
import { minecraft } from "./minecraft.ts";

export const all6Gaming = Command.custom("all6Gaming")
  .withDependencies([
    minecraft,
  ]);
