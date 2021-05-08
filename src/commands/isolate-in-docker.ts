import { Command } from "../model/command.ts";
import { FileSystemPath } from "../model/dependency.ts";
import { readFromUrl } from "../os/read-from-url.ts";
import { ROOT } from "../os/user/target-user.ts";
import {
  CreateFile,
  MODE_EXECUTABLE_775,
  Symlink,
} from "./common/file-commands.ts";
import { docker } from "./docker.ts";

export const isolateInDocker = Command.custom()
  .withDependencies([
    docker,
    new CreateFile(
      ROOT,
      FileSystemPath.of(ROOT, "/usr/local/bin/isolate-in-docker"),
      await readFromUrl(
        "https://raw.githubusercontent.com/hugojosefson/isolate-in-docker/master/isolate-in-docker",
      ),
      false,
      MODE_EXECUTABLE_775,
    ),
    ...[
      `node`,
      `npm`,
      `npx`,
      `yarn`,
      `heroku`,
      `webstorm`,
      `webstorm-install-rust`,
      `goland`,
      `clion`,
      `jetbrains-toolbox`,
      `aws`,
      `firefox40`,
    ].map((name) =>
      new Symlink(
        ROOT,
        "isolate-in-docker",
        FileSystemPath.of(ROOT, `/usr/local/bin/${name}`),
      )
    ),
  ]);
