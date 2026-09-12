import { DepGraph } from "dependency-graph";
import { aliases, catalog, type Recipe } from "./catalog.ts";

export interface PlannedRecipe extends Recipe {
  name: string;
}

export function plan(
  names: string[],
  recipes = catalog,
  rename = aliases,
): PlannedRecipe[] {
  const graph = new DepGraph<Recipe>();
  for (const [name, recipe] of Object.entries(recipes)) {
    graph.addNode(name, recipe);
  }
  for (const [name, recipe] of Object.entries(recipes)) {
    for (const dependency of recipe.needs ?? []) {
      graph.addDependency(name, dependency);
    }
  }
  const selected = new Set<string>();
  for (const input of names) {
    const name = rename[input] ?? input;
    if (!graph.hasNode(name)) {
      throw new Error(
        `Unknown recipe: ${input}. Use 'list' to see available recipes.`,
      );
    }
    for (const dependency of graph.dependenciesOf(name)) {
      selected.add(dependency);
    }
    selected.add(name);
  }
  return graph.overallOrder().filter((name) => selected.has(name)).map((
    name,
  ) => ({ name, ...graph.getNodeData(name) }));
}

export function validatePlatform(
  osRelease: string,
  architecture: string,
  recipes: PlannedRecipe[],
): void {
  const fields = Object.fromEntries(
    osRelease.split("\n").filter((line) => line.includes("=")).map((line) => {
      const index = line.indexOf("=");
      return [
        line.slice(0, index),
        line.slice(index + 1).replace(/^"|"$/g, ""),
      ];
    }),
  );
  if (fields.ID !== "ubuntu" || fields.VERSION_ID !== "26.04") {
    throw new Error(
      "Applying recipes requires Ubuntu 26.04. Planning works on other systems.",
    );
  }
  if (!["x86_64", "aarch64"].includes(architecture)) {
    throw new Error(`Unsupported architecture: ${architecture}`);
  }
  for (const recipe of recipes) {
    if (recipe.architectures && !recipe.architectures.includes(architecture)) {
      throw new Error(
        `${recipe.name} is not available for ${architecture}; select individual supported recipes.`,
      );
    }
  }
}
