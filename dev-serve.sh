#!/bin/sh

set -e

exec deno run --allow-read=. --allow-net https://deno.land/std/http/file_server.ts
