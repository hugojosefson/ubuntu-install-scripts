import { decodeToml, readAll } from "../deps.ts";

type Schema = string;
type Key = string;
type Value = unknown;

const dump: string = new TextDecoder().decode(await readAll(Deno.stdin));
const asToml: Record<Schema, Record<Key, Value>> = decodeToml(dump);

const rows = Object.entries(asToml)
  .map(
    ([schema, stuff]) => {
      return Object.entries(stuff)
        .map(([key, value]) => {
          return [schema, key, JSON.stringify(value)].join(" ");
        });
    },
  ).flat().sort();

const output: string = rows.join("\n");
console.log(output);
