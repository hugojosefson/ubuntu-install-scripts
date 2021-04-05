#!/bin/sh

set -e

exec docker run --net=host --rm -it -v "$(pwd)":"$(pwd)":ro -w "$(pwd)" manjarolinux/base
