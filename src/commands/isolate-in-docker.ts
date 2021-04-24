import { readFromUrl } from "../os/read-from-url.ts";
import { ROOT } from "../os/user/target-user.ts";
import {
  CreateFile,
  MODE_EXECUTABLE_775,
  Symlink,
} from "./common/file-commands.ts";
import { ParallelCommand } from "./common/parallel-command.ts";
import { docker } from "./docker.ts";

export const isolateInDocker = new ParallelCommand([
  docker,
  new CreateFile(
    ROOT,
    "/usr/local/bin/isolate-in-docker",
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
    new Symlink(ROOT, "isolate-in-docker", `/usr/local/bin/${name}`)
  ),
]);
