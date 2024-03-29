import { Command } from "../model/command.ts";
import { targetUser } from "../os/user/target-user.ts";
import { gsettingsToCmds } from "./common/gsettings-to-cmds.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { isDocker } from "../deps.ts";
import { SimpleValue } from "../fn.ts";
const docker = await isDocker();

const gsettingsExecCommand = (deps: Command[] = []) => {
  return (cmd: SimpleValue[]) =>
    new Exec(
      [InstallOsPackage.of("libglib2.0-bin"), ...deps],
      [],
      targetUser,
      {},
      cmd,
    )
      .withSkipIfAny([docker]);
};

export const gsettingsDisableSomeKeyboardShortcuts = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.freedesktop.ibus.general.hotkey trigger []
org.freedesktop.ibus.general.hotkey triggers []
org.gnome.desktop.interface menubar-accel ''
org.gnome.desktop.wm.keybindings activate-window-menu @as []
org.gnome.desktop.wm.keybindings always-on-top @as []
org.gnome.desktop.wm.keybindings begin-move @as []
org.gnome.desktop.wm.keybindings begin-resize @as []
org.gnome.desktop.wm.keybindings cycle-group @as []
org.gnome.desktop.wm.keybindings cycle-group-backward @as []
org.gnome.desktop.wm.keybindings cycle-panels @as []
org.gnome.desktop.wm.keybindings cycle-panels-backward @as []
org.gnome.desktop.wm.keybindings cycle-windows @as []
org.gnome.desktop.wm.keybindings cycle-windows-backward @as []
org.gnome.desktop.wm.keybindings lower @as []
org.gnome.desktop.wm.keybindings maximize @as []
org.gnome.desktop.wm.keybindings maximize-horizontally @as []
org.gnome.desktop.wm.keybindings maximize-vertically @as []
org.gnome.desktop.wm.keybindings minimize @as []
org.gnome.desktop.wm.keybindings move-to-center @as []
org.gnome.desktop.wm.keybindings move-to-corner-ne @as []
org.gnome.desktop.wm.keybindings move-to-corner-nw @as []
org.gnome.desktop.wm.keybindings move-to-corner-se @as []
org.gnome.desktop.wm.keybindings move-to-corner-sw @as []
org.gnome.desktop.wm.keybindings move-to-monitor-down @as []
org.gnome.desktop.wm.keybindings move-to-monitor-left @as []
org.gnome.desktop.wm.keybindings move-to-monitor-right @as []
org.gnome.desktop.wm.keybindings move-to-monitor-up @as []
org.gnome.desktop.wm.keybindings move-to-side-e @as []
org.gnome.desktop.wm.keybindings move-to-side-n @as []
org.gnome.desktop.wm.keybindings move-to-side-s @as []
org.gnome.desktop.wm.keybindings move-to-side-w @as []
org.gnome.desktop.wm.keybindings move-to-workspace-1 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-2 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-3 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-4 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-5 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-6 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-7 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-8 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-9 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-10 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-11 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-12 @as []
org.gnome.desktop.wm.keybindings move-to-workspace-down @as []
org.gnome.desktop.wm.keybindings move-to-workspace-last @as []
org.gnome.desktop.wm.keybindings move-to-workspace-left @as []
org.gnome.desktop.wm.keybindings move-to-workspace-right @as []
org.gnome.desktop.wm.keybindings move-to-workspace-up @as []
org.gnome.desktop.wm.keybindings panel-main-menu @as []
org.gnome.desktop.wm.keybindings raise @as []
org.gnome.desktop.wm.keybindings raise-or-lower @as []
org.gnome.desktop.wm.keybindings set-spew-mark @as []
org.gnome.desktop.wm.keybindings show-desktop @as []
org.gnome.desktop.wm.keybindings switch-applications @as []
org.gnome.desktop.wm.keybindings switch-applications-backward @as []
org.gnome.desktop.wm.keybindings switch-group @as []
org.gnome.desktop.wm.keybindings switch-group-backward @as []
org.gnome.desktop.wm.keybindings switch-input-source @as []
org.gnome.desktop.wm.keybindings switch-input-source-backward @as []
org.gnome.desktop.wm.keybindings switch-panels @as []
org.gnome.desktop.wm.keybindings switch-panels-backward @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-1 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-2 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-3 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-4 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-5 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-6 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-7 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-8 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-9 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-10 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-11 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-12 @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-down @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-last @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-left @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-right @as []
org.gnome.desktop.wm.keybindings switch-to-workspace-up @as []
org.gnome.desktop.wm.keybindings toggle-above @as []
org.gnome.desktop.wm.keybindings toggle-fullscreen @as []
org.gnome.desktop.wm.keybindings toggle-on-all-workspaces @as []
org.gnome.desktop.wm.keybindings toggle-shaded ['']
org.gnome.mutter.wayland.keybindings restore-shortcuts @as []
org.gnome.settings-daemon.plugins.media-keys calculator ['']
org.gnome.settings-daemon.plugins.media-keys control-center ['']
org.gnome.settings-daemon.plugins.media-keys decrease-text-size ['']
org.gnome.settings-daemon.plugins.media-keys eject ['']
org.gnome.settings-daemon.plugins.media-keys email ['']
org.gnome.settings-daemon.plugins.media-keys help @as []
org.gnome.settings-daemon.plugins.media-keys home ['']
org.gnome.settings-daemon.plugins.media-keys increase-text-size ['']
org.gnome.settings-daemon.plugins.media-keys logout @as []
org.gnome.settings-daemon.plugins.media-keys magnifier @as []
org.gnome.settings-daemon.plugins.media-keys magnifier-zoom-in @as []
org.gnome.settings-daemon.plugins.media-keys magnifier-zoom-out @as []
org.gnome.settings-daemon.plugins.media-keys media ['']
org.gnome.settings-daemon.plugins.media-keys mic-mute ['']
org.gnome.settings-daemon.plugins.media-keys next ['']
org.gnome.settings-daemon.plugins.media-keys on-screen-keyboard ['']
org.gnome.settings-daemon.plugins.media-keys pause ['']
org.gnome.settings-daemon.plugins.media-keys play ['']
org.gnome.settings-daemon.plugins.media-keys previous ['']
org.gnome.settings-daemon.plugins.media-keys screenreader @as []
org.gnome.settings-daemon.plugins.media-keys screensaver @as []
org.gnome.settings-daemon.plugins.media-keys search ['']
org.gnome.settings-daemon.plugins.media-keys stop ['']
org.gnome.settings-daemon.plugins.media-keys terminal @as []
org.gnome.settings-daemon.plugins.media-keys toggle-contrast ['']
org.gnome.settings-daemon.plugins.media-keys volume-down ['']
org.gnome.settings-daemon.plugins.media-keys volume-mute ['']
org.gnome.settings-daemon.plugins.media-keys volume-up ['']
org.gnome.settings-daemon.plugins.media-keys www ['']
org.gnome.shell.keybindings focus-active-notification @as []
org.gnome.shell.keybindings open-application-menu @as []
org.gnome.shell.keybindings show-screen-recording-ui @as []
org.gnome.shell.keybindings switch-to-application-1 @as []
org.gnome.shell.keybindings switch-to-application-2 @as []
org.gnome.shell.keybindings switch-to-application-3 @as []
org.gnome.shell.keybindings switch-to-application-4 @as []
org.gnome.shell.keybindings switch-to-application-5 @as []
org.gnome.shell.keybindings switch-to-application-6 @as []
org.gnome.shell.keybindings switch-to-application-7 @as []
org.gnome.shell.keybindings switch-to-application-8 @as []
org.gnome.shell.keybindings switch-to-application-9 @as []
org.gnome.shell.keybindings toggle-application-view @as []
org.gnome.shell.keybindings toggle-message-tray @as []
org.gnome.shell.keybindings toggle-overview @as []
`).map(gsettingsExecCommand([
      "ibus",
      "mutter",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsEnableSomeKeyboardShortcuts = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.desktop.input-sources xkb-options ['compose:ralt']
org.gnome.desktop.peripherals.keyboard remember-numlock-state true
org.gnome.desktop.wm.keybindings close ['<Super>q']
org.gnome.desktop.wm.keybindings panel-run-dialog ['<Alt>F2']
org.gnome.desktop.wm.keybindings switch-windows ['<Alt>Tab']
org.gnome.desktop.wm.keybindings switch-windows-backward ['<Shift><Alt>Tab']
org.gnome.desktop.wm.keybindings toggle-maximized ['<Super>Up']
org.gnome.desktop.wm.keybindings unmaximize ['<Super>Down']
org.gnome.desktop.wm.preferences mouse-button-modifier '<Super>'
org.gnome.desktop.wm.preferences resize-with-right-button true
org.gnome.mutter.keybindings toggle-tiled-left ['<Super>Left']
org.gnome.mutter.keybindings toggle-tiled-right ['<Super>Right']
org.gnome.shell.keybindings screenshot ['<Shift>Print']
org.gnome.shell.keybindings screenshot-window ['<Alt>Print']
org.gnome.shell.keybindings show-screenshot-ui ['Print']

`).map(gsettingsExecCommand([
      "mutter",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsWindows = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.desktop.wm.preferences action-double-click-titlebar 'toggle-maximize'
org.gnome.desktop.wm.preferences action-middle-click-titlebar 'toggle-maximize'
org.gnome.desktop.wm.preferences action-right-click-titlebar 'menu'
org.gnome.desktop.wm.preferences audible-bell true
org.gnome.desktop.wm.preferences auto-raise-delay 500
org.gnome.desktop.wm.preferences auto-raise false
org.gnome.desktop.wm.preferences button-layout 'appmenu:minimize,maximize,close'
org.gnome.desktop.wm.preferences disable-workarounds false
org.gnome.desktop.wm.preferences focus-mode 'click'
org.gnome.desktop.wm.preferences focus-new-windows 'smart'
org.gnome.desktop.wm.preferences num-workspaces 1
org.gnome.desktop.wm.preferences raise-on-click true
org.gnome.desktop.wm.preferences resize-with-right-button true
org.gnome.mutter attach-modal-dialogs false
org.gnome.mutter dynamic-workspaces false
org.gnome.mutter workspaces-only-on-primary false
org.gnome.nautilus.window-state start-with-location-bar true
org.gnome.nautilus.window-state start-with-sidebar true
org.gnome.shell.overrides attach-modal-dialogs false
org.gnome.shell.overrides workspaces-only-on-primary false
`).map(gsettingsExecCommand([
      "gnome-shell",
      "mutter",
      "nautilus",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsPrivacy = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.desktop.notifications show-in-lock-screen false
org.gnome.desktop.privacy old-files-age uint32 30
org.gnome.desktop.privacy recent-files-max-age 30
org.gnome.desktop.privacy remember-app-usage true
org.gnome.desktop.privacy remember-recent-files true
org.gnome.desktop.privacy remove-old-temp-files true
org.gnome.desktop.privacy remove-old-trash-files true
org.gnome.desktop.privacy report-technical-problems true
org.gnome.desktop.remote-desktop.rdp enable false
org.gnome.desktop.screensaver lock-enabled false
org.gnome.desktop.screensaver ubuntu-lock-on-suspend false
org.gnome.desktop.search-providers disable-external true
org.gnome.desktop.session idle-delay uint32 0
org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
org.gnome.shell.weather automatic-location true
org.gnome.system.location enabled true
`).map(gsettingsExecCommand()),
  );

export const gsettingsLookAndFeel = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.desktop.interface color-scheme 'prefer-dark'
org.gnome.desktop.interface enable-animations false
org.gnome.desktop.interface gtk-theme 'Yaru-dark'
org.gnome.gedit.preferences.editor scheme 'Yaru-dark'

org.gnome.gnome-system-monitor cpu-smooth-graph true
org.gnome.gnome-system-monitor cpu-stacked-area-chart true
org.gnome.gnome-system-monitor current-tab 'resources'
org.gnome.gnome-system-monitor disks-interval 5000
org.gnome.gnome-system-monitor graph-update-interval 5000
org.gnome.gnome-system-monitor kill-dialog true
org.gnome.gnome-system-monitor maximized true

org.gnome.nautilus.icon-view default-zoom-level 'larger'
org.gnome.nautilus.list-view default-zoom-level 'small'
org.gnome.nautilus.list-view use-tree-view false
org.gnome.nautilus.preferences click-policy 'double'
org.gnome.nautilus.preferences default-folder-viewer 'list-view'
org.gnome.nautilus.preferences default-sort-in-reverse-order false
org.gnome.nautilus.preferences default-sort-order 'name'
org.gnome.nautilus.preferences recursive-search 'always'
org.gnome.nautilus.preferences show-directory-item-counts 'always'
org.gnome.nautilus.preferences show-image-thumbnails 'always'
org.gnome.nautilus.preferences thumbnail-limit uint64 1000

org.gnome.settings-daemon.plugins.color night-light-enabled false
org.gnome.settings-daemon.plugins.color night-light-schedule-automatic false
org.gnome.settings-daemon.plugins.color night-light-schedule-from 20.0
org.gnome.settings-daemon.plugins.color night-light-schedule-to 5.0
org.gnome.settings-daemon.plugins.color night-light-temperature uint32 2330
`).map(gsettingsExecCommand([
      "gnome-settings-daemon",
      "gnome-system-monitor",
      "nautilus",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsUsefulDefaults = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.FileRoller.Dialogs.Extract recreate-folders true
org.gnome.SessionManager auto-save-session false
org.gnome.SessionManager auto-save-session-one-shot false
org.gnome.desktop.notifications show-banners true
org.gnome.desktop.peripherals.mouse natural-scroll false
org.gnome.nautilus.compression default-compression-format 'tar.xz'
`).map(gsettingsExecCommand([
      "file-roller",
      "gnome-session",
      "nautilus",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsLocalisation = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.desktop.calendar show-weekdate true
org.gnome.desktop.datetime automatic-timezone true
org.gnome.desktop.input-sources per-window false
org.gnome.desktop.interface clock-format '24h'
org.gnome.desktop.interface clock-show-date true
org.gnome.desktop.interface clock-show-seconds false
org.gnome.desktop.interface clock-show-weekday true
org.gnome.gedit.plugins.time custom-format '%Y-%m-%d %H:%M:%S'
org.gnome.gedit.plugins.time selected-format '%c'
org.gtk.Settings.FileChooser clock-format '24h'
`).map(gsettingsExecCommand([
      "gedit",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsGedit = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.gedit.preferences.editor auto-indent true
org.gnome.gedit.preferences.editor auto-save-interval uint32 10
org.gnome.gedit.preferences.editor auto-save true
org.gnome.gedit.preferences.editor background-pattern 'grid'
org.gnome.gedit.preferences.editor bracket-matching true
org.gnome.gedit.preferences.editor create-backup-copy false
org.gnome.gedit.preferences.editor display-line-numbers true
org.gnome.gedit.preferences.editor display-right-margin true
org.gnome.gedit.preferences.editor ensure-trailing-newline true
org.gnome.gedit.preferences.editor highlight-current-line true
org.gnome.gedit.preferences.editor insert-spaces true
org.gnome.gedit.preferences.editor restore-cursor-position true
org.gnome.gedit.preferences.editor right-margin-position uint32 100
org.gnome.gedit.preferences.editor scheme 'oblivion'
org.gnome.gedit.preferences.editor search-highlighting true
org.gnome.gedit.preferences.editor smart-home-end 'after'
org.gnome.gedit.preferences.editor syntax-highlighting true
org.gnome.gedit.preferences.editor tabs-size uint32 4
`).map(gsettingsExecCommand([
      "gedit",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsMeld = Command.custom()
  .withDependencies(
    gsettingsToCmds(`
org.gnome.meld draw-spaces ['space', 'tab', 'newline', 'nbsp', 'leading', 'text', 'trailing']
org.gnome.meld filename-filters [('Backups', true, '#*# .#* ~* *~ *.{orig,bak,swp}'), ('OS-specific metadata', true, '.DS_Store ._* .Spotlight-V100 .Trashes Thumbs.db Desktop.ini'), ('Version Control', true, '_MTN .bzr .svn .svn .hg .fslckout _FOSSIL_ .fos CVS _darcs .git .svn .osc'), ('Binaries', true, '*.{pyc,a,obj,o,so,la,lib,dll,exe}'), ('Media', false, '*.{jpg,gif,png,bmp,wav,mp3,ogg,flac,avi,mpg,xcf,xpm}'), ('node_modules', true, 'node_modules'), ('.idea', true, '.idea'), ('.isolate-in-docker', true, '.isolate-in-docker'), ('.nyc_output', true, '.nyc_output')]
org.gnome.meld highlight-current-line true
org.gnome.meld highlight-syntax true
org.gnome.meld insert-spaces-instead-of-tabs true
org.gnome.meld show-line-numbers true
`).map(gsettingsExecCommand([
      "meld",
    ].map(InstallOsPackage.of))),
  );

export const gsettingsAll: Command = Command.custom().withDependencies([
  gsettingsDisableSomeKeyboardShortcuts,
  gsettingsEnableSomeKeyboardShortcuts,
  gsettingsGedit,
  gsettingsLocalisation,
  gsettingsLookAndFeel,
  gsettingsMeld,
  gsettingsPrivacy,
  gsettingsUsefulDefaults,
  gsettingsWindows,
]);
