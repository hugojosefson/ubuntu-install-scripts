FROM hugojosefson/ubuntu:20.04

RUN apt-get install -y apt-utils

RUN mkdir -p /ubuntu-install-scripts
COPY . /ubuntu-install-scripts

WORKDIR /ubuntu-install-scripts
RUN ./sys/all-1-minimal-sanity
RUN ./sys/all-2-developer-base
RUN ./sys/all-3-developer-web
RUN ./sys/all-4-developer-java
RUN ./sys/all-5-personal
RUN ./user/all-1-minimal-sanity
RUN ./user/all-2-developer-base

CMD ["bash"]
