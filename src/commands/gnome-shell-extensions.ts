import { Command } from "../model/command.ts";
import { ensureSuccessful } from "../os/exec.ts";
import { isInsideDocker } from "../os/is-inside-docker.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallAurPackage, InstallOsPackage } from "./common/os-package.ts";
import { gnomeShellExtensionInstaller } from "./gnome-shell-extension-installer.ts";

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

function installGnomeExtension(id: number): string[] {
  return ["gnome-shell-extension-installer", `${id}`, "--yes"];
}

const uninstallOrDisableGnomeExtension = async (
  uuid: string,
): Promise<string[]> => [
  "sh",
  "-c",
  `gnome-extensions uninstall "${uuid}" 2>/dev/null || gnome-extensions disable "${uuid}"`,
];

const restartGnomeShell = [
  "busctl",
  "--user",
  "call",
  "org.gnome.Shell",
  "/org/gnome/Shell",
  "org.gnome.Shell",
  "Eval",
  "s",
  `'Meta.restart("Enabling installed GNOME Extensions...")'`,
];

export const gnomeShellExtensions = Command.custom()
  .withDependencies([
    gnomeShellExtensionInstaller,
    ...[
      "gnome-shell",
      "gnome-shell-extension-appindicator",
      "gnome-shell-extension-dash-to-panel",
      "gnome-shell-extension-desktop-icons-ng",
      "gnome-shell-extension-pop-shell",
      "pamac-gnome-integration",
    ].map(InstallOsPackage.of),
    ...[
      "gnome-shell-extension-middleclickclose",
      "gnome-shell-extension-sound-output-device-chooser",
    ].map(InstallAurPackage.of),
  ])
  .withRun(async () => {
    const installExtensions: string[][] = await Promise.all(
      [
        "https://extensions.gnome.org/extension/7/removable-drive-menu/",
        "https://extensions.gnome.org/extension/277/impatience/",
        "https://extensions.gnome.org/extension/36/lock-keys/",
        "https://extensions.gnome.org/extension/1720/weeks-start-on-monday-again/",
        "https://extensions.gnome.org/extension/302/windowoverlay-icons/",
      ]
        .map(findGnomeExtensionId)
        .map(installGnomeExtension),
    );
    const uninstallOrDisableExtensions: string[][] = await Promise.all(
      [
        "dash-to-dock@micxgx.gmail.com",
      ]
        .map(uninstallOrDisableGnomeExtension),
    );

    if (isInsideDocker) {
      for (const cmd of uninstallOrDisableExtensions) {
        await ensureSuccessful(targetUser, cmd);
      }
      return;
    }

    for (const cmd of [...installExtensions, ...uninstallOrDisableExtensions]) {
      await ensureSuccessful(targetUser, cmd);
    }
    await ensureSuccessful(targetUser, restartGnomeShell);
  });
