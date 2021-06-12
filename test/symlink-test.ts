import { Symlink } from "../src/commands/common/file-commands.ts";
import { Command, CommandResult } from "../src/model/command.ts";
import { FileSystemPath } from "../src/model/dependency.ts";
import { ROOT } from "../src/os/user/target-user.ts";

Deno.test({
  name: "symlink",
  fn: async () => {
    const testRoot: string = "/tmp/symlink-test59876fd0"; // await Deno.makeTempDir({ prefix: "symlink-test" });
    // await Deno.symlink(`${ROOT.homedir}/Desktop`, `${testRoot}/Desktop`);
    const cmd: Symlink = new Symlink(
      ROOT,
      "isolate-in-docker",
      FileSystemPath.of(ROOT, `${testRoot}/webstorm`),
    );
    const result: CommandResult | void | string | Command[] = await cmd.run();
    console.log(JSON.stringify({ result }));
  },
});
