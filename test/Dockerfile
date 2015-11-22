FROM hugojosefson/ubuntu-gnome:15.10
MAINTAINER Hugo Josefson <hugo@josefson.org>

RUN mkdir -p /ubuntu-install-scripts
COPY . /ubuntu-install-scripts

WORKDIR /ubuntu-install-scripts
RUN ./all-1-minimal-sanity
RUN ./all-2-developer-base
RUN ./all-3-developer-web
RUN ./install-virtualbox
RUN ./all-5-extra-apps

CMD ["bash"]
