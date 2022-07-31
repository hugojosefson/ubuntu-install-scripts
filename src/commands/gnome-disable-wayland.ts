import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { ROOT } from "../os/user/target-user.ts";
import { decodeToml, encodeToml } from "../deps.ts";
import { CreateFile } from "./common/file-commands.ts";
import { InstallOsPackage } from "./common/os-package.ts";

const CONFIG_FILE_PATH = FileSystemPath.of(ROOT, "/etc/gdm3/custom.conf");
type Toml = Record<string, unknown>;

async function getExistingToml(path: FileSystemPath): Promise<Toml> {
  try {
    const text: string = await Deno.readTextFile(path.path);
    return decodeToml(text);
  } catch (e) {
    if (e.code === "ENOENT") { // NotFound
      return {};
    }
    throw e;
  }
}

async function writeToml(path: FileSystemPath, toml: Toml): Promise<void> {
  const text = encodeToml(toml, { whitespace: true });
  await (new CreateFile(ROOT, path, text, false, 0o644)).run();
}

export const gnomeDisableWayland = Command.custom()
  .withDependencies([InstallOsPackage.of("gdm3")])
  .withLocks([CONFIG_FILE_PATH])
  .withRun(async function () {
    const originalToml: Toml = await getExistingToml(CONFIG_FILE_PATH);
    const newToml: Toml = {
      ...originalToml,
      daemon: {
        ...originalToml.daemon,
        DefaultSession: "ubuntu-xorg.desktop",
        WaylandEnable: false,
      },
    };
    await writeToml(CONFIG_FILE_PATH, newToml);
  });
