#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.24";DENO_RUN_ARGS="--unstable --allow-all";: "Via https://github.com/hugojosefson/deno-shebang CC BY 4.0";set -e;(command -v sudo>/dev/null||(apt-get update -qq && apt-get install -yq sudo));(command -v unzip>/dev/null&&command -v curl>/dev/null||(sudo apt-get update -qq && sudo apt-get install -yqq curl unzip));V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";E="$(expr "$(echo "$V"|curl -Gso/dev/null -w%{url_effective} --data-urlencode @- "")" : '..\(.*\)...')";D="$(command -v deno||true)";t(){ d="$(mktemp)";rm "${d}";dirname "${d}";};f(){ m="$(command -v "$0"||true)";l="/* 2>/dev/null";! [ -z $m ]&&[ -r $m ]&&[ "$(head -c3 "$m")" = '#!/' ]&&(read x && read y &&[ "$x" = "#!/bin/sh" ]&&[ "$l" != "${y%"$l"*}" ])<"$m";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.3.0/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};g(){ curl -sSfL "https://semver-version.deno.dev/api/github/denoland/deno/$U";};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;v="$(g)";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;echo -n "Downloading temporary deno...">&2;curl -fsSL https://deno.land/x/install/install.sh|DENO_INSTALL="$i" sh -s "$v" 2>/dev/null >&2;};e;f&&exec deno run $A "$0" "$@";r="$(t)/cli.ts";cat > "$r" <<'//🔚'

import { getCommand } from "./commands/index.ts";
import { config } from "./config.ts";
import { colorlog } from "./deps.ts";

import { Command, CommandResult } from "./model/command.ts";
import { RejectFn } from "./os/defer.ts";
import { isRunningAsRoot } from "./os/user/is-running-as-root.ts";
import { run } from "./run.ts";
import { errorAndExit, usageAndExit } from "./usage.ts";

export const cli = async () => {
  if (!await isRunningAsRoot()) {
    await errorAndExit(
      3,
      "You must run this program as root. Try again with sudo :)",
    );
  }

  const args: string[] = Deno.args;
  if (!args.length) {
    await usageAndExit();
  }

  const commands: Command[] = await Promise.all(args.map(getCommand));
  const runCommandsPromise = run(commands);
  try {
    await runCommandsPromise.then(
      (results: Array<CommandResult>) => {
        results.forEach((result) => {
          if (result.stdout) console.error(colorlog.success(result.stdout));
          if (result.stderr) console.error(colorlog.error(result.stderr));
          if (!(result?.status?.success)) {
            console.error(JSON.stringify(result.status));
          }
        });
        const anyError: CommandResult | undefined = results.find((result) =>
          (!result.status.success) ||
          (result.status.code > 0)
        );
        if (anyError) {
          const err: CommandResult = anyError;
          Deno.exit(err.status.code);
        }
      },
      // Because Promise defines it as ?any:
      // deno-lint-ignore no-explicit-any
      (err?: any): RejectFn => {
        if (config.VERBOSE) {
          if (err?.message) {
            console.error("err.message: " + colorlog.error(err.message));
          }
          if (err?.stack) {
            console.error("err.stack: " + colorlog.warning(err.stack));
          }
          if (err?.stdout) {
            console.error("err.stdout: " + colorlog.success(err.stdout));
          }
          if (err?.stderr) {
            console.error("err.stderr: " + colorlog.error(err.stderr));
          }

          console.error("err: " + colorlog.error(JSON.stringify(err, null, 2)));
        }
        const code: number = err?.status?.code || err?.code || 1;
        Deno.exit(code);
      },
    );
  } finally {
    await runCommandsPromise.finally(() => {
      if (config.VERBOSE) {
        console.error("finally");
      }
      Deno.exit(0);
    });
  }
};

if (import.meta.main) {
  await cli();
}

//🔚
// 2>/dev/null || :; sed -E 's#from "\.#from "https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/ubuntu-22.04/src#g' -i "$r";exec deno run $A "$r" "$@"
