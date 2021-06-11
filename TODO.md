# TODO

## which osPackage provides binary?

### debian?/ubuntu/popos

```bash
sudo apt-get install -y apt-file
sudo apt-file update
apt-file search --verbose --regex '/s?bin/docker$'
```

### arch?/manjaro

```bash
sudo pacman -Ss pkgfile
sudo pkgfile --update
pkgfile --search --binaries --verbose docker
```

See also built-in `pacman -F`:

https://unix.stackexchange.com/questions/14858/in-arch-linux-how-can-i-find-out-which-package-to-install-that-will-contain-file/14865#14865

## barrier

## Printing

https://wiki.manjaro.org/index.php?title=Printing
