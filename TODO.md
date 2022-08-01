# TODO

## ui

git@github.com:alexlafroscia/d_ui.git

## misc

- [ ] set keyboard shortcut F1=any_term_dropdown.ts
- [ ] set Appearance, Style, Dark
- [ ] set Power, Power Saving Options, Screen Blank=never
- [ ] set Accessibility, Enable Animations=false
- [ ] set Sharing=false
- [ ] set Privacy, Screen, Screen Lock, Automatic Screen Lock=false
- [ ] set Privacy, Screen, Screen Lock, Lock Screen on Suspend=false
- [ ] upgrade deps.ts

### wmutils

#### wmutilsPpa

```sh
add-apt-repository ppa:spvkgn/ppa -y --no-update
sed -E s/jammy/focal/g -i /etc/apt/sources.list.d/spvkgn-ubuntu-ppa-jammy.list
mv /etc/apt/sources.list.d/spvkgn-ubuntu-ppa-{jammy,focal}.list

cat > /etc/apt/preferences.d/99spvkgn-repository <<'EOF'
# Allow upgrading only wmutils-core from spvkgn repository
Package: wmutils-core
Pin: release n=spvkgn
Pin-Priority: 500

# Never prefer other packages from the spvkgn repository
Package: *
Pin: release n=spvkgn
Pin-Priority: 1
EOF
apt update
```

#### wmutils

```sh
apt install -y wmutils-core # depends on wmutilsPpa
```
