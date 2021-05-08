import { Command } from "../model/command.ts";
import { idea } from "./idea.ts";
import { java } from "./java.ts";

export const all4DeveloperJava = Command.custom()
  .withDependencies([
    java,
    idea,
  ]);
