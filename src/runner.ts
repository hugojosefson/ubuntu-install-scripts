import { run } from "@hugojosefson/run-simple";
import { fromFileUrl } from "@std/path";
import type { PlannedRecipe } from "./plan.ts";

export class InstallFailure extends Error {
  constructor(readonly recipe: string, readonly code: number) {
    super(
      `${recipe} failed (exit ${code}). Fix the reported error and rerun the same selection.`,
    );
  }
}

/** Native streams keep long installer output visible; run-simple handles short probes. */
export async function execute(
  command: string[],
  options: Deno.CommandOptions = {},
): Promise<number> {
  const [executable, ...args] = command;
  const child = new Deno.Command(executable, {
    args,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    ...options,
  }).spawn();
  return (await child.status).code;
}

export async function apply(
  recipes: PlannedRecipe[],
  exec = execute,
): Promise<void> {
  const uid = (await run(["id", "-u"])).trim();
  if (uid === "0") {
    throw new Error(
      "Run as your normal user, without sudo. Only system steps use sudo.",
    );
  }
  const home = Deno.env.get("HOME");
  if (!home?.startsWith("/")) {
    throw new Error("HOME must be an absolute directory.");
  }
  const username = (await run(["id", "-un"])).trim();
  if (recipes.some((recipe) => recipe.session)) {
    if (
      Deno.env.get("XDG_SESSION_TYPE") !== "wayland" ||
      !Deno.env.get("DBUS_SESSION_BUS_ADDRESS")
    ) {
      throw new Error(
        "GNOME settings require your logged-in Wayland session. Apply other recipes first, then run gnome-settings from the desktop.",
      );
    }
    await run([
      "gsettings",
      "get",
      "org.gnome.desktop.interface",
      "color-scheme",
    ]);
  }
  if (recipes.some((recipe) => recipe.root || recipe.packages)) {
    const code = await exec(["sudo", "-v"]);
    if (code) throw new InstallFailure("sudo", code);
  }
  for (const recipe of recipes) {
    if (!recipe.script && !recipe.packages) continue;
    const file = fromFileUrl(
      new URL(`../recipes/${recipe.script ?? "apt.sh"}`, import.meta.url),
    );
    const args = recipe.packages ??
      (recipe.args ?? []).map((arg) => arg.replaceAll("@HOME@", home));
    const command = ["/bin/bash", file, ...args];
    const env = {
      UBUNTU_INSTALL_USER: username,
      UBUNTU_INSTALL_HOME: home,
      DEBIAN_FRONTEND: "noninteractive",
    };
    const root = recipe.root || recipe.packages;
    console.error(`\n[${recipe.name}] ${recipe.description}`);
    const code = await exec(
      root
        ? [
          "sudo",
          "--",
          "env",
          ...Object.entries(env).map(([key, value]) => `${key}=${value}`),
          ...command,
        ]
        : command,
      { env },
    );
    if (code) throw new InstallFailure(recipe.name, code);
  }
}
