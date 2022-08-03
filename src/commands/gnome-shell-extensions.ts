import { Command } from "../model/command.ts";
import { ensureSuccessful, ensureSuccessfulStdOut } from "../os/exec.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import {
  gnomeShellExtensionInstaller,
  gnomeShellExtensionInstallerFile,
} from "./gnome-shell-extension-installer.ts";

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

function installGnomeExtensionsAndRestartCmd(ids: number[]): string[] {
  return [
    gnomeShellExtensionInstallerFile.path,
    ...ids.map((id) => `${id}`),
    "--yes",
    "--restart-shell",
  ];
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

async function idToUuid(id: number): Promise<string> {
  const response: Response = await fetch(
    `https://extensions.gnome.org/extension-info/?pk=${id}`,
  );
  const { uuid }: { uuid: string } = await response.json();
  if (!uuid) {
    throw new Error(`Gnome extension id ${id} not found`);
  }
  return uuid;
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
    const extensionIds: number[] = [
      // user installed
      "https://extensions.gnome.org/extension/7/removable-drive-menu/",
      "https://extensions.gnome.org/extension/36/lock-keys/",
      "https://extensions.gnome.org/extension/352/middle-click-to-close-in-overview/",
      "https://extensions.gnome.org/extension/1160/dash-to-panel/",
      "https://extensions.gnome.org/extension/1689/always-show-titles-in-overview/",
      "https://extensions.gnome.org/extension/1720/weeks-start-on-monday-again/",
      "https://extensions.gnome.org/extension/4655/date-menu-formatter/", // TODO: set date format to "y-MM-dd\nkk:mm EEE",

      // default ubuntu installed, make sure to enable them
      "https://extensions.gnome.org/extension/615/appindicator-support/",
      "https://extensions.gnome.org/extension/2087/desktop-icons-ng-ding/",
    ]
      .map(findGnomeExtensionId);

    const extensionUuids: string[] = await Promise.all(
      extensionIds.map(idToUuid),
    );

    const uninstallOrDisableExtensions: string[][] = [
      "dash-to-dock@micxgx.gmail.com",
    ]
      .map(uninstallOrDisableGnomeExtensionCmd);

    const installExtensionsAndRestart: string[] =
      installGnomeExtensionsAndRestartCmd(extensionIds);

    const enabledExtensionUuids: string[] = (await ensureSuccessfulStdOut(
      targetUser,
      ["gnome-extensions", "list", "--enabled"],
    )).split("\n");

    const uuidsToDisable: string[] = enabledExtensionUuids.filter((uuid) =>
      !extensionUuids.includes(uuid)
    );
    const disableExtensionsCmds: string[][] = uuidsToDisable.map((uuid) =>
      disableGnomeExtensionCmd(uuid)
    );

    for (
      const cmd of [...disableExtensionsCmds, ...uninstallOrDisableExtensions]
    ) {
      await ensureSuccessful(targetUser, cmd);
    }

    if (isInsideDocker) {
      return;
    }
    await ensureSuccessful(targetUser, installExtensionsAndRestart);
  });
