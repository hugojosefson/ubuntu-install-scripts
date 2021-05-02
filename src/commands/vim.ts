import { AbstractCommand, Command } from "../model/command.ts";
import { DependencyId, FileSystemPath } from "../model/dependency.ts";
import { ROOT } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

export const vim: Command = new class extends AbstractCommand {
  constructor() {
    super("Custom", new DependencyId("vim", "vim"));
    this.dependencies.push(
      InstallOsPackage.of("vim"),
      new LineInFile(
        ROOT,
        FileSystemPath.of(ROOT, "/etc/environment"),
        "EDITOR=vim",
      ),
    );
  }
}();
