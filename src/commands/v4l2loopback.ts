import { filterAsync } from "../fn.ts";
import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ensureSuccessfulStdOut } from "../os/exec.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import {
  InstallOsPackage,
  isInstallableOsPackage,
} from "./common/os-package.ts";

async function getInstalledKernels(): Promise<string[]> {
  const output: string = await ensureSuccessfulStdOut(targetUser, [
    "mhwd-kernel",
    "--listinstalled",
  ]);
  return output
    .split("\n")
    .filter((line: string) => /^ +\* +(.*)/.test(line))
    .map((line) => line.replace(/^ +\* +/, ""))
    .map((s) => s.trim())
    .filter((kernel) => kernel.length > 0);
}

async function getBestKernel(): Promise<string> {
  const output: string = await ensureSuccessfulStdOut(targetUser, [
    "sh",
    "-c",
    "mhwd-kernel --list | grep -Ev -- '-rt$' | sort --version-sort | tail -n 2 | awk '{print $2}'",
  ]);
  const twoNewestNonRealtimeKernels: string[] = output
    .split("\n")
    .map((s) => s.trim())
    .filter((kernel) => kernel.length > 0);

  const theNewestNonReleaseCandidateKernel = twoNewestNonRealtimeKernels[0];
  return theNewestNonReleaseCandidateKernel;
}

export const v4l2loopback = Command.custom()
  .withDependencies([InstallOsPackage.of("mhwd")])
  .withRun(async () => {
    const bestKernel: string = await getBestKernel();
    const installedKernels: string[] = await getInstalledKernels();

    const packageNamesToConsider: string[] = [
      ...installedKernels,
      bestKernel,
    ].flatMap((kernel) => [kernel, `${kernel}-headers`]);

    const dependencies: string[] = await filterAsync(
      isInstallableOsPackage,
      packageNamesToConsider,
    );

    return [
      ...dependencies.map(InstallOsPackage.of),
      InstallOsPackage.of("v4l2loopback-dkms"),
      new LineInFile(
        ROOT,
        FileSystemPath.of(ROOT, "/etc/modprobe.d/v4l2loopback.conf"),
        'options v4l2loopback devices=3  exclusive_caps=1 video_nr=2,3,4 card_label="v4l2loopback2","v4l2loopback3","v4l2loopback4"',
      ),
    ];
  });
