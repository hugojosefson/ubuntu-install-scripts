#!/bin/sh

set -e

exec docker run --rm -it -v "$(pwd)":"$(pwd)":ro -w "$(pwd)" manjarolinux/base
