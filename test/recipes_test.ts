import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { exists } from "@std/fs";

if (!await exists("/.dockerenv")) {
  throw new Error(
    "Run ./test/check. These tests require a disposable Docker container.",
  );
}

const root = fromFileUrl(new URL("../", import.meta.url));
async function bash(script: string, env: Record<string, string> = {}) {
  const result = await new Deno.Command("bash", {
    args: ["-c", script],
    cwd: root,
    env,
    stdout: "piped",
    stderr: "piped",
  }).output();
  return {
    code: result.code,
    stdout: new TextDecoder().decode(result.stdout),
    stderr: new TextDecoder().decode(result.stderr),
  };
}

Deno.test("shell setup preserves custom content and is safe to run twice", async () => {
  const home = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(`${home}/.bashrc`, "# existing personal config\n");
    for (let n = 0; n < 2; n++) {
      const result = await bash("bash recipes/shell.sh", { HOME: home });
      assertEquals(result.code, 0, result.stderr);
    }
    const content = await Deno.readTextFile(`${home}/.bashrc`);
    assertStringIncludes(content, "# existing personal config");
    assertEquals(content.split(" || source ").length, 2);
    assertEquals(
      await Deno.readTextFile(`${home}/.bashrc.ubuntu-install-scripts.bak`),
      "# existing personal config\n",
    );
    assert(!await exists(`${home}/.bashrc.ubuntu-install-scripts.bak.~1~`));
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});

Deno.test("managed files preserve old content and do not rewrite identical content", async () => {
  const home = await Deno.makeTempDir();
  try {
    const result = await bash(
      `source recipes/lib.sh
printf 'old' > "$HOME/managed"
printf 'new' | managed_file "$HOME/managed"
printf 'new' | managed_file "$HOME/managed"
test "$(cat "$HOME/managed")" = new
test "$(cat "$HOME/managed.ubuntu-install-scripts.bak")" = old
test ! -e "$HOME/managed.ubuntu-install-scripts.bak.~1~"`,
      { HOME: home },
    );
    assertEquals(result.code, 0, result.stderr);
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});

Deno.test("a failed provider download never executes a partial script", async () => {
  const home = await Deno.makeTempDir();
  try {
    const result = await bash(
      `source recipes/lib.sh
download() { printf 'touch "$HOME/should-not-exist"' > "$2"; return 22; }
run_provider https://example.invalid/install.sh bash`,
      { HOME: home },
    );
    assertEquals(result.code, 22);
    assert(!await exists(`${home}/should-not-exist`));
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});

Deno.test("provider tools run outside the checkout and its frozen Deno config", async () => {
  const home = await Deno.makeTempDir();
  try {
    const result = await bash(
      `source recipes/lib.sh
download() { printf 'pwd > "$HOME/provider-cwd"' > "$2"; }
run_provider https://example.invalid/install.sh bash`,
      { HOME: home },
    );
    assertEquals(result.code, 0, result.stderr);
    const cwd = (await Deno.readTextFile(`${home}/provider-cwd`)).trim();
    assert(cwd.startsWith("/tmp/"));
    assert(cwd !== root);
    assert(!await exists(cwd));
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});

Deno.test("GNOME shortcut setup preserves existing shortcuts and does not duplicate its entry", async () => {
  const home = await Deno.makeTempDir();
  try {
    const result = await bash(
      `dbus-run-session -- bash -euo pipefail <<'GNOME_TEST'
gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/existing/']"
bash recipes/gnome-settings.sh
bash recipes/gnome-settings.sh
gsettings get org.gnome.settings-daemon.plugins.media-keys custom-keybindings
GNOME_TEST`,
      { HOME: home, XDG_CONFIG_HOME: `${home}/.config` },
    );
    assertEquals(result.code, 0, result.stderr);
    assertStringIncludes(result.stdout, "/existing/");
    assertEquals(
      result.stdout.split("ubuntu-install-scripts-terminal/").length,
      2,
    );
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});
