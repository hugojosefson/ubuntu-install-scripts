# Install scripts, for Ubuntu

_Install scripts for various things I like to install on a fresh Ubuntu virtual
machine._

Do note, that most settings are for how I like them inside virtual machines, so
not likely to be appropriate for your main install! Happy testing!

## Download and run

This will download into `./ubuntu-install-scripts-ubuntu-22.04/`, and show you
the usage/help text:

```bash
wget -qO- https://github.com/hugojosefson/ubuntu-install-scripts/archive/refs/heads/ubuntu-22.04.tar.gz | tar xz
sudo VERBOSE=true ./ubuntu-install-scripts-ubuntu-22.04/src/cli.ts
```
