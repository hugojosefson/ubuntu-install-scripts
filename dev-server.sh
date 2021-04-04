#!/bin/sh

set -e

DIR=${DIR:-src/client}

deno run --allow-read=. --allow-net --unstable https://deno.land/x/dev_server/mod.ts --port=${PORT:-1234} "${DIR}"
