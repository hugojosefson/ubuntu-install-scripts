# Ubuntu workstation setup

This branch configures Ubuntu 26.04 with Deno 2. A recipe is a named group of
installation steps. The installer shows recipes in dependency order before it
applies them. Run it as your normal user. System steps use `sudo`.

The `ubuntu-22.04` branch preserves the previous implementation. Ubuntu 24.04 is
not a target. See [migration notes](docs/migration.md) for the changes to older
commands.

## Use

Install [Deno 2](https://docs.deno.com/runtime/getting_started/installation/)
before you start. The official installation command is:

```bash
curl -fsSL https://deno.land/install.sh | sh
```

Open a new terminal after the Deno installation. From this checkout, list the
recipes or inspect a plan:

```bash
./install list
./install plan base firefox
./install plan web --json
```

Plans do not run installation steps or inspect desktop configuration. Deno can
download missing dependencies into its cache when it starts. The lockfile fixes
the exact dependency versions for this checkout.

To apply a selection on the target machine, run:

```bash
./install apply base firefox
./install apply developer
```

Each recipe installs or updates its selected software. A failure stops the
remaining recipes and returns an error code. After you fix the error, run the
same selection again. Provider scripts can ask for information that their
installations require.

`base` includes Neovim through the `vim` recipe. `developer` adds LazyVim,
GitHub CLI (`gh`), and T3 Code. `personal` includes Keybase, Mullvad, the
Desktop link, and the guarded Downloads cleanup described below.

## Editors and development tools

The `vim` recipe installs Neovim and makes `vim` run `nvim`. It sets `EDITOR`
and `VISUAL` to `nvim` for new shells and user sessions. It leaves Neovim
configuration intact. `base` does not install LazyVim or Node.

The `lazyvim` recipe uses the
[official starter](https://www.lazyvim.org/installation) when no Neovim
configuration exists. It preserves existing LazyVim files and updates their
plugins. It stops if it finds an unrelated Neovim configuration. It installs
configured Mason tools, Treesitter parsers, and Blink completion binaries before
completion. Mason supplies language servers and formatters. Treesitter parsers
supply syntax analysis. The supplied configuration starts without downloads,
including when opening a Lua file and using completion. Custom plugins can have
additional setup requirements.

The `java` recipe installs SDKMAN's recommended Java version and sets it as the
SDKMAN default. SDKMAN supplies the version through its API and performs the
installation. New shells initialize SDKMAN automatically. Use `sdk` to manage
Java versions. The older `sdkman-java` name selects the same recipe.

IntelliJ IDEA and WebStorm use the official Toolbox CLI for installation.
Toolbox owns the installed applications and their desktop launchers. The recipe
downloads Toolbox and its matching CLI with provider checksums. The CLI uses
Toolbox's bundled runtime. The Java development runtime remains under SDKMAN.
See
[JetBrains' current CLI download instructions](https://www.jetbrains.com/help/toolbox-app/offline-remote-development-in-the-toolbox-app.html#tba_agent).
Repeated installation skips builds that Toolbox already owns. A detected
standalone installation does not count as a Toolbox installation.

## Personal directories

The `desktop-is-home` recipe replaces an empty `~/Desktop` directory with a link
to home. It preserves hidden files, nonempty directories, mounts, and existing
links to other locations. It leaves a missing Desktop directory alone.

The `downloads-is-cleaned-on-boot` recipe enables automatic deletion only when
`~/Downloads` already exists and is empty, including hidden files. It refuses
symlinks and mounted directories. After this one-time opt-in, systemd deletes
future Downloads contents at each boot. The installation itself deletes no
Downloads contents. Repeated installation keeps the existing opt-in.

The cleanup rule is
`/etc/tmpfiles.d/ubuntu-install-scripts-downloads-<uid>.conf`. To turn off this
cleanup, remove that rule:

```bash
sudo rm -- "/etc/tmpfiles.d/ubuntu-install-scripts-downloads-$(id -u).conf"
```

## Desktop and browsers

Wayland remains the default. The Foot launcher and icons follow
[GNOME-APP-ICONS.md](GNOME-APP-ICONS.md). The Foot font matches the current
local configuration: JetBrainsMono Nerd Font, size 11, with ligatures. Existing
Foot configuration files remain intact.

Run `./install apply gnome-settings` from your GNOME Wayland session. This
recipe selects the dark theme, click focus, and Ctrl-Alt-T for Foot. It
preserves unrelated keyboard shortcuts. The `t3code` recipe downloads the latest
x86-64 AppImage from T3 Code's release API and checks its SHA-256 digest. It
installs `t3` and `t3code` launchers with the bundled icons. Use
`./install apply t3-icons` to register an existing T3 Code AppImage. Set
`T3_APPIMAGE` if the AppImage is outside your `PATH`.

Firefox uses Mozilla's signed APT repository. Brave uses its official
installation script. Chrome uses Google's DEB package, which installs its update
repository. These browsers run outside Snap and Flatpak. The installer prevents
APT from selecting Snap or Ubuntu's Firefox and Chromium wrappers.

When the Firefox DEB installation succeeds, the recipe removes an installed
Firefox Snap without purging its data. It does not migrate browser profiles
automatically. See
[Mozilla's migration instructions](https://support.mozilla.org/en-US/kb/install-firefox-linux)
before switching an existing profile.

## Installation sources

Provider scripts and release APIs supply changing versions and download
addresses. The installer downloads each provider script completely before it
runs that script. It prints the script address and SHA-256 digest for the
installation log. JetBrains archives use the checksum from the release API.

Mozilla does not supply a general APT installer. Its recipe uses signed
repository metadata for the suite and components. The repository address and
signing key fingerprint identify the trusted provider. If the signing key
changes, the recipe stops for review. Signal supplies its own APT source file,
which the recipe downloads directly.

Recipes that modify managed configuration files save the previous contents with
an `.ubuntu-install-scripts.bak` suffix. Repeated backups use numbered suffixes.
Provider installers control their own backup behavior. Docker adds the user to
its administrative group. Log in again after that step.

## Development

Run all tests in disposable Docker containers:

```bash
./test/check
./test/check bash test/integration.sh
./test/check bash test/developer.sh
./test/editor
```

The test image uses Ubuntu 26.04 and Deno 2.9.6. It contains a separate user
with passwordless sudo for installation tests. Containers receive no host home
directory, Docker socket, or devices. The second command downloads and installs
provider software inside its container. It tests Docker packages and commands
without starting a nested Docker daemon.

The developer test installs Java, both JetBrains IDEs, T3 Code, and LazyVim. The
editor test provisions LazyVim in a fresh container, disconnects its network,
and exercises startup, completion, parsers, and a Lua language server. It also
traces child commands to detect downloads or parser builds during startup.

The checks cover TypeScript, formatting, shell scripts, recipe ordering, error
propagation, and repeated configuration changes. The GNOME configuration test
uses a private D-Bus session inside Docker. Visual launcher behavior and
compositor integration require a desktop VM. See
[validation notes](docs/validation.md) for the recorded results and limits.

Use dependencies from `jsr:@std`, then `jsr:@hugojosefson`, then established JSR
or npm packages. The code uses `@hugojosefson/run-simple` for short command
probes and `dependency-graph` for dependency ordering. Native Deno subprocess
streams display long installation logs as they arrive. The `hj` CLI supplied the
initial Deno feature scaffold in a disposable container. Custom tasks keep this
repository's checks inside Docker.

## License

[MIT](LICENSE). The downloaded Git icon uses
[CC BY 3.0](https://git-scm.com/downloads/logos). Downloaded software keeps its
provider's license.
