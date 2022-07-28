import { Command } from "../model/command.ts";
import { ensureSuccessfulStdOut } from "../os/exec.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";

const dconfPath =
  "/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/";

const gsettingsSchema = "org.gnome.settings-daemon.plugins.media-keys";
const gsettingsKey = "custom-keybindings";

function getGsettingsValue(): Promise<string> {
  return ensureSuccessfulStdOut(targetUser, [
    "gsettings",
    "get",
    gsettingsSchema,
    gsettingsKey,
  ]);
}
function getDconfData(): Promise<string> {
  return ensureSuccessfulStdOut(targetUser, ["dconf", "dump", dconfPath]);
}

export const gnomeCustomKeybindingsBackup = Command.custom()
  .withDependencies([
    InstallOsPackage.of("gnome-settings-daemon"),
    InstallOsPackage.of("dconf-cli"),
    InstallOsPackage.of("libglib2.0-bin"),
  ])
  .withRun(async () => {
    const backupScript = `#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

dconf load ${dconfPath} <<'EOF'
${await getDconfData()}
EOF

gsettings set ${gsettingsSchema} ${gsettingsKey} "${await getGsettingsValue()}"
`;
    console.log(backupScript);
  });
