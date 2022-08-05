import { Command } from "../model/command.ts";
import { ensureSuccessful, ensureSuccessfulStdOut } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import {
  gnomeShellExtensionInstaller,
  gnomeShellExtensionInstallerFile,
} from "./gnome-shell-extension-installer.ts";
import { createTempDir } from "../os/create-temp-dir.ts";
import { isDocker } from "../deps.ts";

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
    const ids: number[] = [
      // user installed
      "https://extensions.gnome.org/extension/7/removable-drive-menu/",
      "https://extensions.gnome.org/extension/36/lock-keys/",
      "https://extensions.gnome.org/extension/352/middle-click-to-close-in-overview/",
      "https://extensions.gnome.org/extension/1160/dash-to-panel/",
      "https://extensions.gnome.org/extension/1689/always-show-titles-in-overview/",
      "https://extensions.gnome.org/extension/1720/weeks-start-on-monday-again/",
      "https://extensions.gnome.org/extension/4655/date-menu-formatter/", // TODO: set date format to "y-MM-dd\nkk:mm EEE",

      // default ubuntu installed, make sure to enable them
      "https://extensions.gnome.org/extension/1301/ubuntu-appindicators/",
      "https://extensions.gnome.org/extension/2087/desktop-icons-ng-ding/",
    ]
      .map(findGnomeExtensionId);

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

    const cwd = (await createTempDir(targetUser)).path;
    for (
      const cmd of [
        ...disableExtensionsCmds,
        ...uninstallOrDisableExtensionsCmds,
      ]
    ) {
      await ensureSuccessful(targetUser, cmd);
    }

    if (await isDocker()) {
      return;
    }

    for (
      const cmd of [
        ...downloadExtensionsCmds,
        ...uuidsToInstall.map(installGnomeExtensionCmd),
        ...uuidsToEnable.map(enableGnomeExtensionCmd),
      ]
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
  });
