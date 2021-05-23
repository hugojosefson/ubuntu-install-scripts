import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ensureSuccessfulStdOut } from "../os/exec.ts";
import { ROOT, targetUser } from "../os/user/target-user.ts";
import { LineInFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

async function installedKernels(): Promise<string[]> {
  const output: string = await ensureSuccessfulStdOut(targetUser, [
    "mhwd",
    "--listinstalled",
  ]);
  return output
    .split("\n")
    .filter((line: string) => /^ +\* +(.*)/.test(line))
    .map((line) => line.replace(/^ +\* +/, ""))
    .map((s) => s.trim())
    .filter((kernel) => kernel.length > 0);
}

export const v4l2loopback = Command.custom()
  .withDependencies([InstallOsPackage.of("mhwd")])
  .withRun(async () => {
    const kernels = await installedKernels();

    const installKernelHeaders = kernels
      .map((kernel) => `${kernel}-headers`)
      .map(InstallOsPackage.of);

    const installV4l2loopback = InstallOsPackage.of("v4l2loopback-dkms")
      .withDependencies(
        installKernelHeaders,
      );

    return [
      installV4l2loopback,
      new LineInFile(
        ROOT,
        FileSystemPath.of(ROOT, "/etc/modprobe.d/v4l2loopback.conf"),
        'options v4l2loopback devices=3  exclusive_caps=1 video_nr=2,3,4 card_label="v4l2loopback2","v4l2loopback3","v4l2loopback4"',
      ),
    ];
  });
