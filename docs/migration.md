# Migration from ubuntu-22.04

The `ubuntu-26.04` branch replaces the old Deno 1 command engine. The historical
branches remain available without merges or deletions. The new CLI separates a
plan from an explicit apply operation. Unknown recipe names fail instead of
becoming arbitrary APT package names.

The old numbered groups remain aliases:

| Previous command                           | Current selection             |
| ------------------------------------------ | ----------------------------- |
| `all-1-minimal-sanity`                     | `base`                        |
| `all-2-developer-base`                     | `developer`                   |
| `all-3-developer-web`                      | `web`                         |
| `all-4-developer-java`                     | `java-development`            |
| `all-5-personal`                           | `personal`                    |
| `all-6-gaming`                             | `gaming`                      |
| `firefox-local`                            | `firefox`, from Mozilla APT   |
| `bash`, `save-bash-history`, path commands | `shell`                       |
| `gsettings-all`                            | `gnome-settings`              |
| `gedit`                                    | GNOME Text Editor             |
| `vim`                                      | Neovim and the default editor |
| `sdkman-java`                              | `java`, managed by SDKMAN     |

`all` selects web development, Java development, personal desktop software, and
Minecraft. It requires a GNOME Wayland session because it includes desktop
configuration. Choose individual recipes for a server or container. The combined
groups include some providers that only supply x86-64 packages. On ARM64, select
recipes whose providers support that architecture.

The following defaults change:

- Keep Wayland enabled and select Foot as the terminal.
- Install browsers from their providers without Snap or Flatpak.
- Install IntelliJ IDEA and WebStorm through the official Toolbox CLI.
- Install SDKMAN's recommended Java and make it the SDKMAN default.
- Install Neovim in `base` and add prepared LazyVim in `developer`.
- Include GitHub CLI and T3 Code in `developer`.
- Use current nvm release metadata instead of a fixed installer version.
- Replace `exa` with `eza` and `neofetch` with `fastfetch`.
- Keep passwordless sudo out of workstation setup.
- Enable Downloads deletion at boot only if the directory is already empty.
- Link an empty Desktop directory to home.
- Include Keybase and Mullvad in `personal`.
- Keep unrelated GNOME preferences and keyboard shortcuts intact.
- Install the GNOME extension manager without replacing the user's extension
  selection.

Some old recipes are retired rather than carried forward with stale assumptions.
These include X11 window helpers, `gnome-disable-wayland`, `downloads-is-tmp`,
and VM-specific shortcuts. Downloads remains a real directory and does not link
to the shared `/tmp` directory. The catalog also omits Flatpak, Insync, Spotify,
Slack, Teams, VirtualBox, and old container wrappers. Existing installations
remain intact unless a selected recipe documents a replacement.

Use your existing scripts and dotfiles for personal tools such as `open-mux` and
`m-temp`. The installer adds their usual user directories to the shell path. It
does not copy private branch data or local dotfiles into this repository. The
original [GNOME icon document](../GNOME-APP-ICONS.md) remains unchanged.

The old `dev-*` scripts are replaced by `test/check` and Deno tasks. The
`settings_diff` command remains a read-only observer of desktop configuration
changes. It no longer depends on the removed Deno 1 data model.
