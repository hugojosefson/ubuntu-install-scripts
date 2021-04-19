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
