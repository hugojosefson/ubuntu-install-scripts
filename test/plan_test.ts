import { assert, assertEquals, assertThrows } from "@std/assert";
import { catalog } from "../src/catalog.ts";
import { plan, validatePlatform } from "../src/plan.ts";

Deno.test("shared dependencies run once, before their consumers", () => {
  const selected = plan(["web", "personal", "firefox-local", "web"]);
  const names = selected.map((recipe) => recipe.name);
  assertEquals(names.length, new Set(names).size);
  for (const recipe of selected) {
    for (const dependency of recipe.needs ?? []) {
      assert(names.indexOf(dependency) < names.indexOf(recipe.name));
    }
  }
  assertEquals(names.filter((name) => name === "firefox"), ["firefox"]);
});
Deno.test("profiles select the requested editors, managers, and personal software", () => {
  const base = plan(["base"]).map((recipe) => recipe.name);
  assert(base.includes("vim"));
  assert(!base.includes("lazyvim"));
  assert(!base.includes("node"));
  const developer = plan(["developer"]).map((recipe) => recipe.name);
  for (const name of ["vim", "lazyvim", "gh", "t3code"]) {
    assert(developer.includes(name));
  }
  const personal = plan(["personal"]).map((recipe) => recipe.name);
  for (
    const name of [
      "keybase",
      "mullvad",
      "desktop-is-home",
      "downloads-is-cleaned-on-boot",
    ]
  ) assert(personal.includes(name));
  const java = plan(["java", "sdkman-java"]).map((recipe) => recipe.name);
  assert(java.indexOf("sdkman") < java.indexOf("java"));
  assertEquals(java.filter((name) => name === "java").length, 1);
  for (const name of ["idea", "webstorm"]) {
    const selected = plan([name]).map((recipe) => recipe.name);
    assert(selected.indexOf("jetbrains-toolbox") < selected.indexOf(name));
    assertEquals(catalog[name].script, "jetbrains-ide.sh");
  }
  const packages = plan(["all"]).flatMap((recipe) => recipe.packages ?? []);
  assert(!packages.includes("vim"));
  assert(!packages.includes("default-jdk"));
});
Deno.test("unknown recipes, missing dependencies, and cycles fail before execution", () => {
  assertThrows(() => plan(["firfox"]), Error, "Unknown recipe");
  assertThrows(() =>
    plan(["a"], { a: { description: "a", needs: ["missing"] } }, {})
  );
  assertThrows(() =>
    plan(["a"], {
      a: { description: "a", needs: ["b"] },
      b: { description: "b", needs: ["a"] },
    }, {})
  );
});
Deno.test("apply only supports Ubuntu 26.04 and supported recipe architectures", () => {
  const ubuntu = 'ID=ubuntu\nVERSION_ID="26.04"\n';
  validatePlatform(ubuntu, "x86_64", plan(["all"]));
  validatePlatform(ubuntu, "aarch64", plan(["firefox"]));
  assertThrows(
    () => validatePlatform(ubuntu, "aarch64", plan(["chrome"])),
    Error,
    "chrome",
  );
  assertThrows(() =>
    validatePlatform('ID=ubuntu\nVERSION_ID="24.04"', "x86_64", [])
  );
  assertThrows(() =>
    validatePlatform('ID=debian\nVERSION_ID="26.04"', "x86_64", [])
  );
});
Deno.test("every recipe references an existing script and avoids Snap/X11 tools", async () => {
  for (const recipe of Object.values(catalog)) {
    if (recipe.script) {
      assert(
        (await Deno.stat(
          new URL(`../recipes/${recipe.script}`, import.meta.url),
        )).isFile,
      );
    }
    for (const packageName of recipe.packages ?? []) {
      assert(
        ![
          "snapd",
          "chromium",
          "chromium-browser",
          "arandr",
          "xdotool",
          "wmctrl",
        ].includes(packageName),
      );
    }
  }
  const names = plan(["all"]).map((recipe) => recipe.name);
  assert(!names.includes("gnome-disable-wayland"));
  assert(!names.includes("sudo-no-password"));
});
