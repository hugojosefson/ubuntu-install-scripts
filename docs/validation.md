# Validation on 2026-09-12

All runtime tests ran in disposable Ubuntu 26.04 Docker containers on x86-64.
The test image uses Deno 2.9.6. No installer recipe ran against the host
operating system or desktop. Host configuration reads supplied the Foot font,
theme, focus mode, and existing tool preferences.

## Automated checks

The checks pass for TypeScript, Deno lint, Deno formatting, and ShellCheck.
Seventeen tests cover planning, platform restrictions, error propagation,
provider isolation, configuration backups, and repeated application. They also
cover profile selections, editor defaults, safe Desktop linking, and Downloads
cleanup. The Downloads test runs systemd's boot cleanup against disposable
files, including hidden files and links to files outside Downloads. The planning
tests run without subprocess or write permissions. The GNOME tests use a private
D-Bus session and preserve an existing shortcut.

The APT audit resolves every package in the catalog with `apt-get --simulate`.
This audit found the removed `cheese` package, which is replaced by
`gnome-snapshot`. The browser installation also confirms that APT cannot select
`snapd` or the Ubuntu Firefox wrapper. Firefox remains selected from
`packages.mozilla.org` after a second installation.

## Installation results

These installations and commands pass in the containers:

| Software          | Observed result                                                                    |
| ----------------- | ---------------------------------------------------------------------------------- |
| Firefox           | Mozilla DEB 155.0.1, repeat installation, and a headless screenshot                |
| Brave             | Provider installer, native DEB 1.95.101                                            |
| Google Chrome     | Provider DEB 153.0.8010.36 and its update repository                               |
| Docker            | Engine packages 29.8.0, CLI, Compose 5.5.1, and repeat installation                |
| Deno              | Official installer and version command                                             |
| hj                | JSR installation, help, scaffold generation, and feature detection                 |
| Node              | nvm release installer, Node LTS 24.21.0 and current 26.8.2, plus npm and Yarn      |
| VS Code           | Provider DEB 1.137.0 and its update repository                                     |
| Signal            | Provider APT source file and DEB 8.27.0                                            |
| Foot              | DEB 1.25.0, Nerd Font, launcher, icons, and terminal selection                     |
| Starship          | Provider installer and version 1.26.0                                              |
| Gitk              | DEB, launcher, Git icon, and repeated application                                  |
| JetBrains Toolbox | Toolbox 3.7.2.87231 and matching official CLI, both with provider checksums        |
| IntelliJ IDEA     | Toolbox CLI installation of 2026.2.2, Toolbox metadata and launcher, repeat skip   |
| WebStorm          | Toolbox CLI installation of 2026.2.2, Toolbox metadata and launcher, repeat skip   |
| Java              | SDKMAN installation, Temurin 25.0.4 default, version command, repeat installation  |
| Neovim / LazyVim  | Neovim 0.11.6, plugin updates, Mason tools, parsers, and native completion library |
| T3 Code           | Release API AppImage 0.0.40, SHA-256 check, bundled icons, and repeat installation |
| Keybase           | Provider DEB 6.6.3, package configuration, and CLI version                         |
| Mullvad           | Provider DEB 2026.4, package configuration, and CLI version                        |

The provider tests exposed a Deno installer that inherited this checkout's
frozen configuration. Provider scripts now run in their own temporary
directories. The nvm test also exposed a failure when resolving the moving
`node` alias after installation. The recipe now uses the activated executable
and records its exact version as the default. The complete provider test passes
after these changes.

LazyVim also passes after provisioning in a fresh container and disconnecting
that container from the network. The test loads completion and configured
parsers, opens a Lua file, and starts its language server. A trace of child
commands detects download attempts and parser builds. None occur. Parser
installation during setup runs in controlled order because overlapping
background builds can corrupt partially installed parsers. The installer waits
for configured Mason tools and Blink's native completion library before it
finishes.

The T3 Code test installs the application independently of browsers and IDEs. It
extracts the AppImage and checks all linked runtime libraries. This check
requires an explicit `libgbm1` dependency in addition to GTK and NSS.

JetBrains' old CLI documentation omits its download address. The corrected
[provider instructions](https://www.jetbrains.com/help/toolbox-app/offline-remote-development-in-the-toolbox-app.html#tba_agent)
describe an agent archive whose build matches Toolbox. Its current `install`
command creates Toolbox-managed IDE installations and desktop launchers. The
recipe reads the build from the release API and checks the result through the
CLI's installed-tool list.

The installed local `hj` project excludes its own fresh releases from Deno's
dependency-age delay. The `hj` recipe follows that policy while retaining the
one-day delay for other dependencies. No reproducible defect in `hj` was found
during this work. The local GitHub workflow is custom because it builds and
tests this repository inside Docker.

## Remaining limits

The tests do not exercise a full GNOME compositor or an ARM64 machine. Visual
icon association, application grouping, and Ctrl-Alt-T behavior still need a
GNOME Wayland desktop VM. The private D-Bus test proves that the stored shortcut
configuration preserves unrelated entries. It does not prove that GNOME handles
the shortcut correctly on a running desktop.

Docker containers cannot provide all sandbox or system-service operations that a
desktop VM provides. Firefox printed a user-namespace restriction warning but
produced its headless screenshot. Signal's package installation printed an
`unshare` restriction warning and completed successfully. No browser sandbox
flags or host security configuration were changed. The Docker test covers
installation and commands, not a running nested daemon.

Mullvad installs its service, but Docker does not run systemd as PID 1. Its
daemon does not start in this test. VPN connectivity and Keybase account login
remain untested. JetBrains IDE and T3 Code graphical sessions also require a
desktop VM. The editor test covers the supplied LazyVim configuration. Arbitrary
custom plugins can require separate installation or authentication.

The APT package audit covers the remaining distribution packages without
installing every application. Full installations of Rust, Homebrew, PassFF, and
Minecraft remain untested. No GitHub workflow run is recorded for these local
changes.

To repeat the available checks, run:

```bash
./test/check
./test/check bash test/integration.sh
./test/check bash test/desktop.sh
./test/check bash test/audit-packages.sh
./test/check bash test/developer.sh
./test/check bash test/personal-apps.sh
./test/check bash test/t3code.sh
./test/editor
```
