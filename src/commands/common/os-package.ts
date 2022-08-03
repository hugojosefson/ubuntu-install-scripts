import { memoize } from "../../deps.ts";
import { Command, RunResult } from "../../model/command.ts";
import {
  FileSystemPath,
  FLATPAK,
  OS_PACKAGE_SYSTEM,
  SNAP,
} from "../../model/dependency.ts";
import { ensureSuccessful, isSuccessful } from "../../os/exec.ts";
import { isInsideDocker } from "../../deps.ts";
import { ROOT, targetUser } from "../../os/user/target-user.ts";
import { LineInFile } from "./file-commands.ts";
import { Exec } from "../exec.ts";
import { REFRESH_OS_PACKAGES } from "../refresh-os-packages.ts";
import { Ish, resolveValue } from "../../fn.ts";

export type OsPackageName = string;
export type BrewPackageName = string;
export type FlatpakPackageName = string;
export type SnapPackageName = string;
export type RustPackageName = string;
export type PackageName =
  | OsPackageName
  | BrewPackageName
  | FlatpakPackageName
  | SnapPackageName
  | RustPackageName;

export abstract class AbstractPackageCommand<T extends PackageName>
  extends Command {
  readonly packageName: T;

  protected constructor(packageName: T) {
    super();
    this.packageName = packageName;
  }

  toString() {
    return JSON.stringify({ packageName: this.packageName });
  }
}

export class InstallOsPackage extends AbstractPackageCommand<OsPackageName> {
  private constructor(packageName: OsPackageName) {
    super(packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
    this.skipIfAll.push(() => isInstalledOsPackage(packageName));
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "apt",
      "install",
      "-y",
      this.packageName,
    ], {});

    return `Installed OS package ${this.packageName}.`;
  }

  static of: (packageName: OsPackageName) => InstallOsPackage = memoize(
    (packageName: OsPackageName): InstallOsPackage =>
      new InstallOsPackage(packageName),
  );
}

export class RemoveOsPackage extends AbstractPackageCommand<OsPackageName> {
  private constructor(packageName: OsPackageName) {
    super(packageName);
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);
    this.skipIfAll.push(async () => !(await isInstalledOsPackage(packageName)));
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "apt",
      "purge",
      "-y",
      "--auto-remove",
      this.packageName,
    ]);

    return `Removed package ${this.packageName}.`;
  }

  static of: (packageName: OsPackageName) => RemoveOsPackage = (
    packageName: OsPackageName,
  ) => new RemoveOsPackage(packageName);
}

export class ReplaceOsPackage extends Command {
  readonly removePackageName: OsPackageName;
  readonly installPackageName: OsPackageName;

  private constructor(
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) {
    super();
    this.locks.push(OS_PACKAGE_SYSTEM);
    this.dependencies.push(REFRESH_OS_PACKAGES);

    this.removePackageName = removePackageName;
    this.installPackageName = installPackageName;

    this.skipIfAll.push(() => isInstalledOsPackage(installPackageName));
    this.skipIfAll.push(async () =>
      !(await isInstalledOsPackage(removePackageName))
    );
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "apt",
      "purge",
      "-y",
      this.removePackageName,
      this.installPackageName + "+",
    ]).catch(this.doneDeferred.reject);

    return `Replaced package ${this.removePackageName} with ${this.installPackageName}.`;
  }
  /**
   * @deprecated Use .of2() instead.
   */
  static of(): Command {
    throw new Error("Use .of2() instead.");
  }
  static of2: (
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) => ReplaceOsPackage = (
    removePackageName: OsPackageName,
    installPackageName: OsPackageName,
  ) => new ReplaceOsPackage(removePackageName, installPackageName);
}

const bashRc = FileSystemPath.of(targetUser, "~/.bashrc");

export const brewBashRcLine =
  `eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"`;
const brewDeps = [
  ...["build-essential", "procps", "curl", "file", "git"]
    .map(
      InstallOsPackage.of,
    ),
  new LineInFile(
    targetUser,
    bashRc,
    brewBashRcLine,
  ),
];

export const HOME_LINUXBREW = FileSystemPath.of(ROOT, "/home/linuxbrew");
const brewInstall = new Exec(
  brewDeps,
  [HOME_LINUXBREW],
  targetUser,
  { env: { NONINTERACTIVE: `1` } },
  [
    "bash",
    "-c",
    "curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash",
  ],
);

export const brew = brewInstall.withSkipIfAll([
  () =>
    isSuccessful(targetUser, [
      "bash",
      "-c",
      `${brewBashRcLine} && command -v brew`,
    ], {}),
]);

export class InstallBrewPackage
  extends AbstractPackageCommand<BrewPackageName> {
  private constructor(packageName: BrewPackageName) {
    super(packageName);
    this.locks.push(HOME_LINUXBREW);
    this.dependencies.push(brew);
    this.skipIfAll.push(() => isInstalledBrewPackage(packageName));
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(targetUser, [
      "bash",
      "-c",
      `${brewBashRcLine} && brew install --quiet ${this.packageName}`,
    ]);

    return `Installed Brew package ${this.packageName}.`;
  }

  static of: (packageName: BrewPackageName) => InstallBrewPackage = memoize(
    (packageName: BrewPackageName): InstallBrewPackage =>
      new InstallBrewPackage(packageName),
  );
}

export class RemoveBrewPackage extends AbstractPackageCommand<BrewPackageName> {
  private constructor(packageName: BrewPackageName) {
    super(packageName);
    this.locks.push(HOME_LINUXBREW);
    this.dependencies.push(brew);
    this.skipIfAll.push(async () =>
      !(await isInstalledBrewPackage(packageName))
    );
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(targetUser, [
      "bash",
      "-c",
      `${brewBashRcLine} && brew remove --quiet ${this.packageName}`,
    ]);

    return `Removed Brew package ${this.packageName}.`;
  }

  static of: (packageName: BrewPackageName) => RemoveBrewPackage = (
    packageName: BrewPackageName,
  ) => new RemoveBrewPackage(packageName);
}

export const flatpakOsPackages = ["xdg-desktop-portal-gtk", "flatpak"];
export const flatpak: Command = new Exec(
  flatpakOsPackages.map(InstallOsPackage.of),
  [FLATPAK],
  ROOT,
  {},
  [
    "flatpak",
    "remote-add",
    "--if-not-exists",
    "flathub",
    "https://flathub.org/repo/flathub.flatpakrepo",
  ],
)
  .withSkipIfAll([
    () =>
      isSuccessful(ROOT, [
        "sh",
        "-c",
        "flatpak remotes --system --columns=name | grep flathub",
      ], { verbose: false }),
  ]);

export const snapOsPackages = ["snapd", "snapd-xdg-open"];
export const snap: Command = new Exec(
  snapOsPackages.map(InstallOsPackage.of),
  [SNAP],
  ROOT,
  {},
  ["snap", "refresh"],
);

export class InstallFlatpakPackage
  extends AbstractPackageCommand<FlatpakPackageName> {
  private constructor(packageName: FlatpakPackageName) {
    super(packageName);
    this.locks.push(FLATPAK);
    this.dependencies.push(flatpak);
    this.skipIfAll.push(() => isInstalledFlatpakPackage(packageName));
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "flatpak",
      "install",
      "--or-update",
      "--noninteractive",
      ...(isInsideDocker ? ["--no-deploy"] : []),
      "flathub",
      this.packageName,
    ]);

    return `Installed Flatpak package ${this.packageName}.`;
  }

  static of: (
    packageName: FlatpakPackageName,
  ) => InstallFlatpakPackage = memoize(
    (packageName: FlatpakPackageName): InstallFlatpakPackage =>
      new InstallFlatpakPackage(packageName),
  );
}

export class InstallSnapPackage
  extends AbstractPackageCommand<SnapPackageName> {
  private readonly classic: boolean;

  private constructor(packageName: SnapPackageName, classic: boolean) {
    super(packageName);
    this.classic = classic;
    this.locks.push(SNAP);
    this.dependencies.push(snap);
    this.skipIfAll.push(() => isInstalledSnapPackage(packageName));
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "snap",
      "install",
      ...(this.classic ? ["--classic"] : []),
      this.packageName,
    ]);

    return `Installed Snap package ${this.packageName}${
      this.classic ? " in classic mode" : ""
    }.`;
  }

  static of: (
    packageName: SnapPackageName,
  ) => InstallSnapPackage = memoize(
    (packageName: SnapPackageName): InstallSnapPackage =>
      new InstallSnapPackage(packageName, false),
  );

  static ofClassic: (
    packageName: SnapPackageName,
  ) => InstallSnapPackage = memoize(
    (packageName: SnapPackageName): InstallSnapPackage =>
      new InstallSnapPackage(packageName, true),
  );
}

export class RemoveFlatpakPackage
  extends AbstractPackageCommand<FlatpakPackageName> {
  private constructor(packageName: FlatpakPackageName) {
    super(packageName);
    this.locks.push(FLATPAK);
    this.dependencies.push(flatpak);
    this.skipIfAll.push(async () =>
      !(await isInstalledFlatpakPackage(packageName))
    );
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "flatpak",
      "uninstall",
      "--noninteractive",
      this.packageName,
    ]);

    return `Removed Flatpak package ${this.packageName}.`;
  }

  static of: (packageName: FlatpakPackageName) => RemoveFlatpakPackage = (
    packageName: FlatpakPackageName,
  ) => new RemoveFlatpakPackage(packageName);
}

export class RemoveSnapPackage extends AbstractPackageCommand<SnapPackageName> {
  private constructor(packageName: SnapPackageName) {
    super(packageName);
    this.locks.push(SNAP);
    this.dependencies.push(snap);
    this.skipIfAll.push(async () =>
      !(await isInstalledSnapPackage(packageName))
    );
  }

  async run(): Promise<RunResult> {
    await ensureSuccessful(ROOT, [
      "snap",
      "remove",
      this.packageName,
    ]);

    return `Removed Snap package ${this.packageName}.`;
  }

  static of: (packageName: SnapPackageName) => RemoveSnapPackage = (
    packageName: SnapPackageName,
  ) => new RemoveSnapPackage(packageName);
}

function isInstalledOsPackage(
  packageName: OsPackageName,
): Promise<boolean> {
  return isSuccessful(ROOT, [
    "bash",
    "-c",
    `[[ "$(dpkg-query --show -f '\${status}' "${packageName}" 2>/dev/null)" == "install ok installed" ]]`,
  ], { verbose: false });
}

export function isInstallableOsPackage(
  packageName: OsPackageName,
): Promise<boolean> {
  return isSuccessful(ROOT, [
    `dpkg`,
    `-l`,
    packageName,
  ], { verbose: false });
}

function isInstalledBrewPackage(
  packageName: BrewPackageName,
): Promise<boolean> {
  return isSuccessful(targetUser, [
    "brew",
    "search",
    "--formula",
    `/^${packageName}$/`,
  ], { verbose: false });
}

function isInstalledFlatpakPackage(
  packageName: FlatpakPackageName,
): Promise<boolean> {
  return isSuccessful(ROOT, [
    "bash",
    "-c",
    `flatpak list --columns application | grep --line-regexp '${packageName}'`,
  ], { verbose: false });
}

function isInstalledSnapPackage(
  packageName: SnapPackageName,
): Promise<boolean> {
  return isSuccessful(ROOT, ["snap", "list", "--", packageName], {
    verbose: false,
  });
}

export function installOsPackageFromUrl(
  expectedPackageName: string,
  debUrl: Ish<string>,
): Command {
  return new Exec(
    [
      "curl",
      "gdebi-core",
    ].map(InstallOsPackage.of),
    [OS_PACKAGE_SYSTEM],
    ROOT,
    {},
    async () => [
      "bash",
      "-c",
      `
set -euo pipefail
IFS=$'\n\t'

tmp_file="$(mktemp --suffix=.deb)"
trap 'rm -f -- "$tmp_file"' EXIT
curl -sLf "${await resolveValue(debUrl)}" -o "$tmp_file"
gdebi --non-interactive "$tmp_file"
  `,
    ],
  )
    .withSkipIfAny([
      () => isInstalledOsPackage(expectedPackageName),
    ]);
}
