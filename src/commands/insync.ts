import { Command } from "../model/command.ts";
import {
  InstallOsPackage,
  installOsPackageFromUrl,
} from "./common/os-package.ts";
import { targetUser } from "../os/user/target-user.ts";
import { ensureSuccessfulStdOut } from "../os/exec.ts";

export const insync: Command = installOsPackageFromUrl(
  "insync",
  () =>
    ensureSuccessfulStdOut(targetUser, [
      "bash",
      "-c",
      `
set -euo pipefail
IFS=$'\n\t'

codename="$(lsb_release -cs)"
base_url="http://apt.insync.io/ubuntu"
deb_path="$(curl -sfL "$base_url/dists/$codename/non-free/binary-amd64/Packages.gz" | gunzip | awk '/^Package: insync$/,/^Filename: /{print $2}' | tail -n1)"
deb_url="$base_url/$deb_path"
echo "$deb_url"
    `,
    ]),
)
  .withDependencies([
    InstallOsPackage.of("lsb-release"),
    InstallOsPackage.of("curl"),
  ]);
