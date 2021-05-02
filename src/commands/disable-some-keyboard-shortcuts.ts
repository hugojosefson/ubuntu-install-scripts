import { AbstractCommand } from "../model/command.ts";
import { DependencyId } from "../model/dependency.ts";
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

export const disableSomeKeyboardShortcuts = new class extends AbstractCommand {
  constructor() {
    super(
      "Custom",
      new DependencyId(
        "disableSomeKeyboardShortcuts",
        "disableSomeKeyboardShortcuts",
      ),
    );
    this.dependencies.push(...[
      set("unmaximize", "['<Primary><Super>Down', '<Super>Down']"),
      ...["toggle-shaded", "begin-resize", "begin-move", "cycle-group"].map(
        setEmpty,
      ),
    ].map((cmd) =>
      new Exec([InstallOsPackage.of("glib2")], [], targetUser, {}, cmd)
    ));
  }
}();
