import { targetUser } from "../os/user/target-user.ts";
import { Exec } from "./exec.ts";

const set = (key: string, value: string) => [
  "gsettings",
  "set",
  "org.gnome.desktop.wm.keybindings",
  key,
  value,
];

const setEmpty = (key: string) => set(key, "['']");

export const disableSomeKeyboardShortcuts = Exec.sequential(targetUser, {}, [
  set("unmaximize", "['<Primary><Super>Down', '<Super>Down']"),
  ...["toggle-shaded", "begin-resize", "begin-move", "cycle-group"].map(
    setEmpty,
  ),
]);
