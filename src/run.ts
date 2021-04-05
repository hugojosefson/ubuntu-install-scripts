#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.8";DENO_RUN_ARGS="--unstable --allow-all";: "Via https://github.com/hugojosefson/deno-shebang CC BY 4.0";set -e;(command -v sudo>/dev/null||pacman -Sy --noconfirm sudo>/dev/null);(command -v unzip>/dev/null||pacman -Sy --noconfirm unzip>/dev/null);V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";U="$(expr "$(echo "$V"|curl -Gso/dev/null -w%{url_effective} --data-urlencode @- "")" : '..\(.*\)...')";D="$(command -v deno||true)";t(){ d="$(mktemp)";rm "${d}";dirname "${d}";};f(){ m="$(command -v "$0"||true)";l="/* 2>/dev/null";! [ -z $m ]&&[ -r $m ]&&[ "$(head -c3 "$m")" = '#!/' ]&&(read x && read y &&[ "$x" = "#!/bin/sh" ]&&[ "$l" != "${y%"$l"*}" ])<"$m";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.3.0/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};g(){ curl -sSfL "https://api.mattandre.ws/semver/github/denoland/deno/$U";};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;v="$(g)";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;curl -fsSL https://deno.land/x/install/install.sh|DENO_INSTALL="$i" sh -s "$v" 2>/dev/null >&2;};e;f&&exec deno run $A "$0" "$@";r="$(t)/run.ts";cat > "$r" <<'//🔚'

import { error, success, warning } from "https://deno.land/x/colorlog/mod.ts";

import { getCommand } from "./commands/index.ts";
import { Command, CommandResult } from "./model/command.ts";
import { Enqueued, Queue } from "./model/queue.ts";
import { usageAndExit } from "./usage.ts";

const run = async (
  commandStrings: Array<string>,
): Promise<Array<CommandResult>> => {
  const queue = new Queue();
  const promise: Promise<Array<Enqueued<Command>>> = Promise.all(
    commandStrings
      .map(getCommand)
      .map((command) => queue.enqueue(command)),
  );
  const enqueueds: Array<Enqueued<Command>> = await promise;
  const promises: Array<Promise<CommandResult>> = enqueueds.map((
    enqueued: Enqueued<Command>,
  ) => enqueued.promise);
  const commandResults: Array<CommandResult> = await Promise.all(promises);
  return commandResults;
};
export default run;

if (import.meta.main) {
  if (!Deno.args.length) {
    usageAndExit();
  }
  await run(Deno.args).then(
    (results: Array<CommandResult>) => {
      results.forEach((result) => {
        result.stdout && console.log(success(result.stdout));
        result.stderr && console.error(error(result.stderr));
        if (!result?.status?.success) {
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
    (err: any) => {
      if (err.message) console.error(error(err.message));
      if (err.stack) console.error(warning(err.stack));
      console.error(error(JSON.stringify(err, null, 2)));
      const code: number = (err?.status || err)?.code || 1;
      Deno.exit(code);
    },
  );
}

//🔚
// 2>/dev/null || :; sed -E 's#from "\.#from "https://raw.githubusercontent.com/hugojosefson/ubuntu-install-scripts/manjaro-wip/src#g' -i "$r";exec deno run $A "$r" "$@"
