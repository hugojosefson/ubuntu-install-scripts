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

## Desktop and browsers

Wayland remains the default. The Foot launcher and icons follow
[GNOME-APP-ICONS.md](GNOME-APP-ICONS.md). The Foot font matches the current
local configuration: JetBrainsMono Nerd Font, size 11, with ligatures. Existing
Foot configuration files remain intact.

Run `./install apply gnome-settings` from your GNOME Wayland session. This
recipe selects the dark theme, click focus, and Ctrl-Alt-T for Foot. It
preserves unrelated keyboard shortcuts. Use `./install apply t3-icons` to
register an existing T3 Code AppImage. Set `T3_APPIMAGE` if the AppImage is
outside your `PATH`.

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
```

The test image uses Ubuntu 26.04 and Deno 2.9.6. It contains a separate user
with passwordless sudo for installation tests. Containers receive no host home
directory, Docker socket, or devices. The second command downloads and installs
provider software inside its container. It tests Docker packages and commands
without starting a nested Docker daemon.

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
