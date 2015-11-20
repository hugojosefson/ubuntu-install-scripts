FROM ubuntu:15.10

RUN echo Updated packages 2015-11-20 13:51 UTC
RUN apt-get update && apt-get install -y aptitude && aptitude dist-upgrade --purge -y
RUN apt-get install -y -d ubuntu-gnome-desktop

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y ubuntu-gnome-desktop
RUN apt-get install -y sudo

RUN mkdir -p /ubuntu-install-scripts
COPY . /ubuntu-install-scripts

WORKDIR /ubuntu-install-scripts
RUN ./all-1-minimal-sanity
RUN ./all-2-developer-base
RUN ./all-3-developer-web
RUN ./all-4-virtualization
RUN ./all-5-extra-apps

CMD ["bash"]
