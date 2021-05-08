import { Command } from "../model/command.ts";
import { targetUser } from "../os/user/target-user.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { Exec } from "./exec.ts";

const set = (key: string, value: string) => [
  "gsettings",
  "set",
  "org.gnome.desktop.wm.keybindings",
  key,
  value,
];

const setEmpty = (key: string) => set(key, "['']");

const gsettingsExecCommand = (cmd: Array<string>) =>
  new Exec([InstallOsPackage.of("glib2")], [], targetUser, {}, cmd);

export const disableSomeKeyboardShortcuts = Command.custom()
  .withDependencies([
    set("unmaximize", "['<Primary><Super>Down', '<Super>Down']"),
    ...["toggle-shaded", "begin-resize", "begin-move", "cycle-group"].map(
      setEmpty,
    ),
  ].map(gsettingsExecCommand));
