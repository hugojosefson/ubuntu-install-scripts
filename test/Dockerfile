FROM denoland/deno:2.9.6 AS deno
FROM ubuntu:26.04 AS test-runner
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates sudo bash git curl gnupg jq unzip xz-utils \
    shellcheck python3 python3-gi gir1.2-glib-2.0 dbus-daemon \
    dconf-cli libglib2.0-bin gsettings-desktop-schemas gnome-settings-daemon-common \
    desktop-file-utils systemd strace && rm -rf /var/lib/apt/lists/*
COPY --from=deno /usr/bin/deno /usr/local/bin/deno
RUN useradd --create-home --shell /bin/bash installer && \
    printf 'installer ALL=(ALL) NOPASSWD: ALL\n' > /etc/sudoers.d/installer && \
    chmod 0440 /etc/sudoers.d/installer
WORKDIR /work
COPY --chown=installer:installer . .
USER installer
ENV DENO_DIR=/home/installer/.cache/deno
RUN deno cache --frozen src/cli.ts test/*_test.ts
CMD ["bash", "test/inside-container.sh"]
