import { Command } from "../model/command.ts";
import { ensureSuccessful, ensureSuccessfulStdOut } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallAurPackage } from "./common/os-package.ts";

const findGnomeExtensionId = async (uuid: string): Promise<number> => {
  const idString: string = await ensureSuccessfulStdOut(targetUser, [
    "bash",
    "-c",
    `echo q | gnome-shell-extension-installer -s "${uuid}" | grep 'Page 1 of' | sed -E 's/.?*, "pk": ([0-9]+), .*/\\1/g'`,
  ]);

  const id: number = parseInt(idString, 10);
  if (id) {
    return id;
  }

  throw new Error(
    `Gnome extension id not found for uuid: ${JSON.stringify(uuid)}`,
  );
};

const installGnomeExtension = async (
  id: Promise<number>,
): Promise<string[]> => [
  "gnome-shell-extension-installer",
  `${await id}`,
  "--yes",
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
  `'Meta.restart("Enabling installed GNOME Extensions…")'`, // TODO: start without sudo, obtain sudo at runtime, use targetUser directly as-is with Deno.env as-is.
];

export const gnomeExtensions = Command.custom()
  .withDependencies([InstallAurPackage.of("gnome-shell-extension-installer")])
  .withRun(async () => {
    const installExtensions: string[][] = await Promise.all(
      [
        "impatience@gfxmonk.net",
        "middleclickclose@paolo.tranquilli.gmail.com",
        "lockkeys@vaina.lt",
        "sound-output-device-chooser@kgshank.net",
        "weeks-start-on-monday@extensions.gnome-shell.fifi.org",
        "drive-menu@gnome-shell-extensions.gcampax.github.com",
        "appindicatorsupport@rgcjonas.gmail.com",
        "dash-to-panel@jderose9.github.com",
        "ding@rastersoft.com",
        "drive-menu@gnome-shell-extensions.gcampax.github.com",
        "lockkeys@vaina.lt",
        "middleclickclose@paolo.tranquilli.gmail.com",
        // "pamac-updates@manjaro.org",
        // "pop-shell@system76.com",
        "sound-output-device-chooser@kgshank.net",
        "user-theme@gnome-shell-extensions.gcampax.github.com",
        "weeks-start-on-monday@extensions.gnome-shell.fifi.org",
        "windowoverlay-icons@sustmidown.centrum.cz",
      ]
        .map(findGnomeExtensionId)
        .map(installGnomeExtension),
    );
    for (const installExtension of installExtensions) {
      await ensureSuccessful(targetUser, installExtension);
    }
    await ensureSuccessful(targetUser, restartGnomeShell);
  });
