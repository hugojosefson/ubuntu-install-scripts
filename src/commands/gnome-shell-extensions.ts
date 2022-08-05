import { Command } from "../model/command.ts";
import { ensureSuccessful, ensureSuccessfulStdOut } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import {
  gnomeShellExtensionInstaller,
  gnomeShellExtensionInstallerFile,
} from "./gnome-shell-extension-installer.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { dconfLoadRoot } from "./common/dconf-load.ts";
import { gsettingsToCmds } from "./common/gsettings-to-cmds.ts";
import { isDocker } from "../deps.ts";
import { SimpleValue } from "../fn.ts";

function findGnomeExtensionId(url: string): number {
  const id: number | undefined = url.split("/")
    .map((s) => parseInt(s, 10))
    .find((n) => n > 0);

  if (id) {
    return id;
  }

  throw new Error(
    `Gnome extension id not found in url: ${JSON.stringify(url)}`,
  );
}

function downloadGnomeExtensions(ids: number[]): string[][] {
  if (ids.length === 0) {
    return [];
  }
  return [[
    gnomeShellExtensionInstallerFile.path,
    "--no-install",
    ...ids.map((id) => `${id}`),
  ]];
}

function uninstallOrDisableGnomeExtensionCmd(uuid: string): string[] {
  return [
    "sh",
    "-c",
    `gnome-extensions uninstall "${uuid}" 2>/dev/null || gnome-extensions disable "${uuid}" || true`,
  ];
}

function disableGnomeExtensionCmd(uuid: string): string[] {
  return [
    "sh",
    "-c",
    `gnome-extensions disable "${uuid}" || true`,
  ];
}

function installGnomeExtensionCmd(uuid: string): string[] {
  return [
    "gnome-extensions",
    "install",
    "--force",
    `${uuid}.shell-extension.zip`,
  ];
}

function enableGnomeExtensionCmd(uuid: string): string[] {
  return [
    "gnome-extensions",
    "enable",
    uuid,
  ];
}

async function idToUuid(id: number): Promise<string> {
  const response: Response = await fetch(
    `https://extensions.gnome.org/extension-info/?pk=${encodeURIComponent(id)}`,
  );
  const { uuid }: { uuid: string } = await response.json();
  if (!uuid) {
    throw new Error(`Gnome extension id ${id} not found`);
  }
  return uuid;
}

async function uuidToId(uuid: string): Promise<number> {
  const response: Response = await fetch(
    `https://extensions.gnome.org/extension-info/?uuid=${
      encodeURIComponent(uuid)
    }`,
  );
  const { pk }: { pk: number } = await response.json();
  if (!pk) {
    throw new Error(`Gnome extension uuid ${uuid} not found`);
  }
  return pk;
}

interface ExtensionConfig {
  gsettings?: string;
  dconf?: string;
}

export const gnomeShellExtensions = Command.custom()
  .withDependencies([
    gnomeShellExtensionInstaller,
    ...[
      "gnome-shell-extensions",
      "gnome-shell-extension-manager",
      "gnome-shell-extension-appindicator",
    ].map(InstallOsPackage.of),
  ])
  .withRun(async () => {
    /**
     * Use /settings_diff to get the config for each extension.
     */
    const extensionConfigs: Record<string, ExtensionConfig> = {
      // user installed
      "https://extensions.gnome.org/extension/7/removable-drive-menu/": {},
      "https://extensions.gnome.org/extension/36/lock-keys/": {
        dconf: `
[org/gnome/shell/extensions/lockkeys]
notification-preferences='osd'
style='both'
`,
      },
      "https://extensions.gnome.org/extension/352/middle-click-to-close-in-overview/":
        {
          dconf: `
[org/gnome/shell/extensions/middleclickclose]
close-button='middle'
rearrange-delay=750
`,
        },
      "https://extensions.gnome.org/extension/1160/dash-to-panel/": {
        dconf: `
[org/gnome/shell/extensions/dash-to-panel]
animate-app-switch=false
animate-window-launch=false
appicon-margin=4
appicon-padding=4
dot-style-focused='DOTS'
dot-style-unfocused='DOTS'
group-apps=false
group-apps-label-font-size=14
group-apps-label-max-width=500
group-apps-use-fixed-width=false
group-apps-use-launchers=false
hide-overview-on-startup=true
hot-keys=true
hotkeys-overlay-combo='ALWAYS'
leftbox-padding=-1
panel-anchors='{"0":"MIDDLE"}'
panel-element-positions='{"0":[{"element":"showAppsButton","visible":true,"position":"stackedTL"},{"element":"activitiesButton","visible":false,"position":"stackedTL"},{"element":"leftBox","visible":true,"position":"stackedTL"},{"element":"taskbar","visible":true,"position":"stackedTL"},{"element":"centerBox","visible":true,"position":"stackedBR"},{"element":"rightBox","visible":true,"position":"stackedBR"},{"element":"dateMenu","visible":true,"position":"stackedBR"},{"element":"systemMenu","visible":true,"position":"stackedBR"},{"element":"desktopButton","visible":true,"position":"stackedBR"}]}'
panel-lengths='{"0":100}'
panel-positions='{"0":"TOP"}'
panel-sizes='{"0":32}'
primary-monitor=0
progress-show-count=true
scroll-icon-action='PASS_THROUGH'
scroll-panel-action='NOTHING'
secondarymenu-contains-showdetails=true
shortcut=@as []
shortcut-num-keys='BOTH'
shortcut-previews=false
shortcut-text=''
show-appmenu=false
show-tooltip=false
show-window-previews=false
status-icon-padding=-1
tray-padding=-1
window-preview-title-position='TOP'
`,
      },
      "https://extensions.gnome.org/extension/1689/always-show-titles-in-overview/":
        {
          dconf: `
[org/gnome/shell/extensions/always-show-titles-in-overview]
app-icon-position='Bottom'
do-not-show-app-icon-when-fullscreen=false
hide-background=false
hide-icon-for-video-player=false
show-app-icon=true
window-active-size-inc=15
`,
        },
      "https://extensions.gnome.org/extension/1720/weeks-start-on-monday-again/":
        {
          dconf: `
[org/gnome/shell/extensions/weeks-start-on-monday]
start-day=1
`,
        },
      "https://extensions.gnome.org/extension/4655/date-menu-formatter/": {
        dconf: `
[org/gnome/shell/extensions/date-menu-formatter]
pattern='y-MM-dd\\\\nkk:mm EEE'
remove-messages-indicator=false
`,
      },

      // default ubuntu installed, make sure to enable them
      "https://extensions.gnome.org/extension/1301/ubuntu-appindicators/": {
        dconf: `
[org/gnome/shell/extensions/appindicator]
icon-brightness=0.0
icon-contrast=0.0
icon-opacity=240
icon-saturation=0.0
icon-size=0
tray-pos='right'
`,
      },
      "https://extensions.gnome.org/extension/2087/desktop-icons-ng-ding/": {
        dconf: `
[org/gnome/nautilus/preferences]
click-policy='double'
default-folder-viewer='list-view'
default-sort-in-reverse-order=false
default-sort-order='name'
recursive-search='always'
show-delete-permanently=false
show-directory-item-counts='always'
show-image-thumbnails='always'
thumbnail-limit=uint64 1000

[org/gnome/shell/extensions/ding]
add-volumes-opposite=false
dark-text-in-labels=false
icon-size='standard'
show-drop-place=true
show-home=false
show-link-emblem=true
show-network-volumes=true
show-trash=true
show-volumes=true
start-corner='top-right'
use-nemo=false

[org/gtk/settings/file-chooser]
clock-format='24h'
show-hidden=false
`,
      },
    };
    const extensionConfigsByUuid: Record<string, ExtensionConfig> = Object
      .fromEntries(
        await Promise.all(
          Object.entries(extensionConfigs)
            .map(([url, config]) => [findGnomeExtensionId(url), config])
            .map(async ([id, config]) => [await idToUuid(id), config]),
        ),
      );
    const urls: string[] = Object.keys(extensionConfigs);
    const ids: number[] = urls.map(findGnomeExtensionId);

    const uuids: string[] = await Promise.all(
      ids.map(idToUuid),
    );

    const uninstallOrDisableExtensionsCmds: string[][] = [
      "dash-to-dock@micxgx.gmail.com",
    ]
      .map(uninstallOrDisableGnomeExtensionCmd);

    const installedExtensionUuids: string[] = (await ensureSuccessfulStdOut(
      targetUser,
      ["gnome-extensions", "list"],
    )).split("\n");

    const uuidsToDownload: number[] = uuids.filter(
      (uuid) => !installedExtensionUuids.includes(uuid),
    );

    const idsToDownload: number[] = await Promise.all(
      uuidsToDownload.map(uuidToId),
    );

    const uuidsToInstall: string[] = await Promise.all(
      idsToDownload.map(idToUuid),
    );

    const downloadExtensionsCmds: string[][] = downloadGnomeExtensions(
      idsToDownload,
    );

    const enabledExtensionUuids: string[] = (await ensureSuccessfulStdOut(
      targetUser,
      ["gnome-extensions", "list", "--enabled"],
    )).split("\n");

    const uuidsToDisable: string[] = enabledExtensionUuids.filter((uuid) =>
      !uuids.includes(uuid)
    );
    const uuidsToEnable: string[] = uuids.filter((uuid) =>
      !enabledExtensionUuids.includes(uuid)
    );

    const disableExtensionsCmds: string[][] = uuidsToDisable.map((uuid) =>
      disableGnomeExtensionCmd(uuid)
    );

    const dconfConfigs: string[] = uuids
      .map((uuid) => extensionConfigsByUuid[uuid]?.dconf)
      .filter(Boolean)
      .map((config) => config.trim())
      .filter(Boolean);

    const gsettingsConfigs: string[] = uuids
      .map((uuid) => extensionConfigsByUuid[uuid]?.gsettings)
      .filter(Boolean)
      .map((config) => config.trim())
      .filter(Boolean);

    const cwd = (await createTempDir(targetUser)).path;
    for (
      const cmd: SimpleValue[] of [
        ...disableExtensionsCmds,
        ...uninstallOrDisableExtensionsCmds,
      ].filter(checkPotentialCmd)
    ) {
      await ensureSuccessful(targetUser, cmd);
    }

    if (await isDocker()) {
      return;
    }

    for (
      const cmd: SimpleValue[] of [
        ...downloadExtensionsCmds,
        ...uuidsToInstall.map(installGnomeExtensionCmd),
        ...uuidsToEnable.map(enableGnomeExtensionCmd),
        ...gsettingsConfigs.map(gsettingsToCmds),
      ].filter(checkPotentialCmd)
    ) {
      try {
        await ensureSuccessful(targetUser, cmd, { cwd });
      } catch (e) {
        throw new Error(
          `Failed to run ${
            cmd.join(" ")
          } in ${cwd}. Please try again after logging in to gnome the next time.`,
          e,
        );
      }
    }

    return dconfConfigs.map(dconfLoadRoot);
  });

function checkPotentialCmd(potentialCmd) {
  if (typeof potentialCmd === "string") {
    throw new Error(
      `Unexpected string: potentialCmd=${JSON.stringify(potentialCmd)}`,
    );
  }
  if (!Array.isArray(potentialCmd)) {
    throw new Error(
      `Unexpected non-array: potentialCmd=${JSON.stringify(potentialCmd)}`,
    );
  }
  if (potentialCmd.length === 0) {
    throw new Error(
      `Unexpected empty array: potentialCmd=${JSON.stringify(potentialCmd)}`,
    );
  }
  return true;
}
