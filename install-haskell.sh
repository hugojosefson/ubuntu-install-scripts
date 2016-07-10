#!/bin/bash

set -e

which aptitude || sudo apt-get install -y aptitude
which ghc || sudo aptitude install -y ghc
which ghc-mod || sudo aptitude install -y ghc-mod
