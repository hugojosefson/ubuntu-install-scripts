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

Deno.test("vim selects Neovim without creating or replacing Neovim configuration", async () => {
  const home = await Deno.makeTempDir();
  try {
    const result = await bash(
      `bash recipes/shell.sh
bash recipes/vim.sh
test ! -e "$HOME/.config/nvim"
mkdir -p "$HOME/.config/nvim"
printf 'personal configuration' > "$HOME/.config/nvim/init.lua"
bash recipes/vim.sh
source "$HOME/.config/ubuntu-install-scripts/bash.sh"
test "$EDITOR" = nvim
test "$VISUAL" = nvim
test -x "$HOME/.local/bin/vim"
test "$(cat "$HOME/.config/nvim/init.lua")" = 'personal configuration'`,
      { HOME: home },
    );
    assertEquals(result.code, 0, result.stderr);
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});

Deno.test("Desktop linking preserves hidden files and symlinks and only removes an empty directory", async () => {
  const home = await Deno.makeTempDir();
  try {
    const result = await bash(
      `bash recipes/desktop-is-home.sh
test ! -e "$HOME/Desktop"
mkdir "$HOME/Desktop" "$HOME/keep"
printf 'keep' > "$HOME/Desktop/.hidden"
bash recipes/desktop-is-home.sh
test "$(cat "$HOME/Desktop/.hidden")" = keep
mv "$HOME/Desktop/.hidden" "$HOME/keep/.hidden"
rmdir "$HOME/Desktop"
ln -s keep "$HOME/Desktop"
bash recipes/desktop-is-home.sh
test "$(readlink "$HOME/Desktop")" = keep
rm "$HOME/Desktop"
mkdir "$HOME/Desktop"
bash recipes/desktop-is-home.sh
bash recipes/desktop-is-home.sh
test "$(readlink "$HOME/Desktop")" = .
test "$(cat "$HOME/keep/.hidden")" = keep`,
      { HOME: home },
    );
    assertEquals(result.code, 0, result.stderr);
  } finally {
    await Deno.remove(home, { recursive: true });
  }
});

Deno.test("Downloads cleanup requires an empty real directory and never follows links", async () => {
  // Quotes, whitespace, and % exercise tmpfiles path escaping too.
  const parent = await Deno.makeTempDir();
  const home = `${parent}/home % with "quotes"`;
  await Deno.mkdir(home);
  try {
    const result = await bash(
      `set -euo pipefail
config="/etc/tmpfiles.d/ubuntu-install-scripts-downloads-$(id -u).conf"
test ! -e "$config"
trap 'sudo rm -f -- "$config"' EXIT
setup() {
  sudo env UBUNTU_INSTALL_USER="$(id -un)" UBUNTU_INSTALL_HOME="$HOME" bash recipes/downloads-is-cleaned-on-boot.sh
}
setup
test ! -e "$config"
mkdir "$HOME/Downloads" "$HOME/keep"
printf 'keep' > "$HOME/Downloads/.hidden"
setup
test ! -e "$config"
mv "$HOME/Downloads/.hidden" "$HOME/keep/.hidden"
rmdir "$HOME/Downloads"
ln -s keep "$HOME/Downloads"
setup
test ! -e "$config"
rm "$HOME/Downloads"
mkdir "$HOME/Downloads"
chmod 0750 "$HOME/Downloads"
setup
test -s "$config"
printf 'future download' > "$HOME/Downloads/.future"
ln -s "$HOME/keep" "$HOME/Downloads/keep-link"
setup
test -f "$HOME/Downloads/.future"
# Ordinary cleanup must leave downloads alone. Only --boot permits deletion.
sudo systemd-tmpfiles --remove "$config"
test -f "$HOME/Downloads/.future"
sudo systemd-tmpfiles --create --remove --boot "$config"
test ! -e "$HOME/Downloads/.future"
test ! -L "$HOME/Downloads/keep-link"
test "$(stat -c %a "$HOME/Downloads")" = 750
test "$(cat "$HOME/keep/.hidden")" = keep
rmdir "$HOME/Downloads"
ln -s keep "$HOME/Downloads"
sudo systemd-tmpfiles --create --remove --boot "$config" || true
test "$(cat "$HOME/keep/.hidden")" = keep
test -L "$HOME/Downloads"`,
      { HOME: home },
    );
    assertEquals(result.code, 0, result.stderr);
  } finally {
    await Deno.remove(parent, { recursive: true });
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
