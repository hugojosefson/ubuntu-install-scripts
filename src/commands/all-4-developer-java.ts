import { idea } from "./idea.ts";
import { java } from "./java.ts";

export const all4DeveloperJava = new SequentialCommand([
  java,
  idea,
]);
