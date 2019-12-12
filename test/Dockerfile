FROM fedora:31

RUN mkdir -p /fedora-install-scripts
COPY . /fedora-install-scripts

WORKDIR /fedora-install-scripts
RUN ./sys/all-1-minimal-sanity
RUN ./sys/all-2-developer-base
RUN ./sys/all-3-developer-web
RUN ./sys/all-4-developer-java
RUN ./sys/all-5-personal
RUN ./user/all-1-minimal-sanity
RUN ./user/all-2-developer-base

CMD ["bash"]
