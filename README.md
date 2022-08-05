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
sudo ./ubuntu-install-scripts-ubuntu-22.04/src/cli.ts
```

> Do note that usually, during the first run, you will be asked to try again
> after having restarted Gnome.
>
> If so, please **log out** and **log in**, or restart the VM. Then run the same
> command again.
>
> This is because Gnome doesn't pick up installed extensions when installing
> them via `gnome-extensions install` until the next time it starts. After that,
> we can apply settings for the newly installed extensions.
