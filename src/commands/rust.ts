import { targetUser } from "../os/user/target-user.ts";
import {
  AbstractPackageCommand,
  InstallOsPackage,
  RustPackageName,
} from "./common/os-package.ts";
import { Exec } from "./exec.ts";
import { RunResult } from "../model/command.ts";
import { ensureSuccessful, isSuccessful } from "../os/exec.ts";
import { memoize } from "../deps.ts";
import { FileSystemPath } from "../model/dependency.ts";

export const rust = new Exec(
  [
    InstallOsPackage.of("build-essential"),
    InstallOsPackage.of("cmake"),
  ],
  [],
  targetUser,
  {},
  ["sh", "-c", "curl -fsSL https://sh.rustup.rs | sh -s -- -y"],
);

export class InstallRustPackage
  extends AbstractPackageCommand<RustPackageName> {
  private constructor(packageName: RustPackageName) {
    super(packageName);
    this.locks.push(FileSystemPath.of(targetUser, "~/.cargo"));
    this.dependencies.push(rust);
    this.skipIfAll.push(() => isInstalledRustPackage(packageName));
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(targetUser, [
      "bash",
      "-c",
      `. <(grep cargo/ "${
        FileSystemPath.of(targetUser, "~/.bashrc").path
      }") && cargo install --locked ${this.packageName}`,
    ]);

    return `Installed Rust package ${this.packageName}.`;
  }

  static of: (packageName: RustPackageName) => InstallRustPackage = memoize(
    (packageName: RustPackageName): InstallRustPackage =>
      new InstallRustPackage(packageName),
  );
}
function isInstalledRustPackage(
  packageName: RustPackageName,
): Promise<boolean> {
  return isSuccessful(targetUser, [
    "bash",
    "-c",
    `. <(grep cargo/ "${
      FileSystemPath.of(targetUser, "~/.bashrc").path
    }") && command -v ${packageName}`, // not really accurate, but cargo install checks if it's installed too.
  ], { verbose: false });
}
