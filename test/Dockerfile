FROM hugojosefson/popos:20.04

RUN apt-get update
RUN apt-get install -y apt-utils
RUN apt-get purge -y --auto-remove gnome-initial-setup

WORKDIR /ubuntu-install-scripts

COPY sys/all-1-minimal-sanity sys/
COPY sys/common.bash sys/
COPY sys/update-packages sys/
COPY sys/install-tmuxinator-byobu-bash_aliases sys/
COPY sys/install-tabbed sys/
COPY sys/install-vim sys/
RUN ./sys/all-1-minimal-sanity

COPY sys/all-2-developer-base sys/
COPY sys/install-github-cli sys/
COPY sys/install-github-git-plugin sys/
COPY sys/install-docker sys/
COPY sys/install-isolate-in-docker sys/
COPY sys/install-virt-manager sys/
RUN ./sys/all-2-developer-base

COPY sys/all-3-developer-web sys/
COPY sys/install-network-utils sys/
COPY sys/install-brave-browser sys/
RUN ./sys/all-3-developer-web

COPY sys/all-4-developer-java sys/
COPY sys/install-java sys/
RUN ./sys/all-4-developer-java

COPY sys/all-5-personal sys/
COPY sys/install-keybase sys/
COPY sys/install-yubikey sys/
COPY sys/install-nordvpn sys/
COPY sys/install-insync sys/
COPY sys/install-xpra sys/
COPY sys/install-rust sys/
RUN ./sys/all-5-personal

COPY user/all-1-minimal-sanity user/
COPY user/add-home-bin-to-path user/
COPY user/save-bash-history user/
COPY user/.bash_aliases user/
COPY user/install-tmuxinator-byobu-bash_aliases user/
COPY user/home-is-desktop user/
COPY user/tmp-is-downloads user/
RUN ./user/all-1-minimal-sanity

COPY user/all-2-developer-base user/
COPY user/install-gitk user/
COPY user/install-git-prompt user/
COPY user/install-github-git-plugin user/
COPY user/install-idea user/
COPY user/install-webstorm user/
COPY user/add-node_modules-bin-to-path user/
RUN ./user/all-2-developer-base

CMD ["bash"]
