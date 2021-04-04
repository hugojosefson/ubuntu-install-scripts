#!/bin/sh

set -e

deno run --allow-read=. --allow-write=. --allow-net --unstable https://deno.land/x/dev_server/mod.ts --port=${PORT:-1234}
