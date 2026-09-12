export interface Recipe {
  description: string;
  needs?: string[];
  packages?: string[];
  script?: string;
  args?: string[];
  root?: boolean;
  session?: boolean;
  architectures?: string[];
}

const apt = (description: string, ...packages: string[]): Recipe => ({
  description,
  needs: ["bootstrap"],
  packages,
});
const script = (
  description: string,
  file: string,
  root = false,
  needs = ["bootstrap"],
  args: string[] = [],
): Recipe => ({ description, script: file, root, needs, args });
const group = (description: string, ...needs: string[]): Recipe => ({
  description,
  needs,
});

/** Recipes describe work; importing the catalog never inspects or changes the OS. */
export const catalog: Record<string, Recipe> = {
  bootstrap: {
    description: "APT prerequisites and policy preventing Snap installation",
    script: "bootstrap.sh",
    root: true,
  },
  base: group(
    "Shell tools and a Wayland terminal",
    "cli-tools",
    "shell",
    "foot",
    "starship",
  ),
  developer: group(
    "Development tools",
    "base",
    "git",
    "gitk",
    "gh",
    "docker",
    "deno",
    "hj",
    "fzf",
    "meld",
  ),
  web: group(
    "Web development and native provider browsers",
    "developer",
    "browsers",
    "node",
    "rust",
    "code",
    "webstorm",
  ),
  browsers: group(
    "Firefox, Brave, and Google Chrome from their providers",
    "firefox",
    "brave",
    "chrome",
  ),
  personal: group(
    "Desktop applications and GNOME preferences",
    "desktop-apps",
    "pass",
    "yubikey",
    "signal-desktop",
    "gnome-settings",
    "gnome-shell-extensions",
  ),
  gaming: group("Minecraft launcher", "minecraft"),
  all: group("Workstation setup", "web", "java", "idea", "personal", "gaming"),
  "cli-tools": apt(
    "Common command line tools",
    "bash-completion",
    "ca-certificates",
    "command-not-found",
    "dos2unix",
    "jq",
    "man-db",
    "manpages",
    "ncdu",
    "tree",
    "openssh-client",
    "ripgrep",
    "fd-find",
    "bat",
    "eza",
    "moreutils",
    "unzip",
    "zip",
    "tmux",
    "vim",
  ),
  "desktop-apps": apt(
    "Desktop applications and fonts",
    "baobab",
    "gnome-snapshot",
    "docx2txt",
    "ffmpeg",
    "gimp",
    "gnome-tweaks",
    "imagemagick",
    "inkscape",
    "fonts-noto",
    "fonts-dejavu",
    "fonts-liberation",
    "fastfetch",
  ),
  git: apt("Git and useful helpers", "git", "git-absorb", "git-revise", "tig"),
  gh: apt("GitHub CLI", "gh"),
  fzf: apt("Fuzzy finder", "fzf"),
  meld: apt("Visual diff tool", "meld"),
  vim: apt("Vim", "vim"),
  eog: apt("Image viewer", "eog"),
  gedit: apt("GNOME text editor", "gnome-text-editor"),
  "network-utils": apt(
    "Network tools",
    "bind9-dnsutils",
    "iproute2",
    "netcat-openbsd",
    "nmap",
    "traceroute",
  ),
  android: apt("Android device tools", "adb", "fastboot"),
  yubikey: apt(
    "YubiKey tools",
    "yubikey-manager",
    "yubikey-personalization",
    "yubico-piv-tool",
  ),
  libreoffice: apt(
    "LibreOffice with English and Swedish support",
    "libreoffice",
    "libreoffice-l10n-en-gb",
    "libreoffice-l10n-sv",
  ),
  shell: script("Add user tool paths and persistent Bash history", "shell.sh"),
  foot: script(
    "Foot launcher, icons, Nerd Font, and preferred terminal",
    "foot.sh",
    false,
    ["foot-packages", "shell"],
  ),
  "foot-packages": apt(
    "Foot and desktop integration tools",
    "foot",
    "desktop-file-utils",
    "xdg-utils",
    "xdg-terminal-exec",
    "fontconfig",
  ),
  gitk: script(
    "Gitk launcher with the Git icon and gk wrapper",
    "gitk.sh",
    false,
    ["gitk-packages", "shell"],
  ),
  "gitk-packages": apt("Gitk and desktop tools", "gitk", "desktop-file-utils"),
  "t3-icons": script(
    "Register an existing T3 AppImage and its bundled icons",
    "t3-icons.sh",
    false,
    ["foot-packages", "shell"],
  ),
  "gnome-settings": {
    ...script(
      "Dark theme, click focus, and Ctrl-Alt-T for Foot",
      "gnome-settings.sh",
      false,
      ["foot", "gnome-settings-packages"],
    ),
    session: true,
  },
  "gnome-settings-packages": apt(
    "GNOME configuration tools",
    "libglib2.0-bin",
    "python3-gi",
    "gir1.2-glib-2.0",
    "gnome-settings-daemon-common",
    "gsettings-desktop-schemas",
  ),
  "gnome-shell-extensions": apt(
    "GNOME extension manager; choose compatible extensions in the desktop",
    "gnome-shell-extension-manager",
    "gnome-shell-extension-appindicator",
  ),
  firefox: script(
    "Firefox from Mozilla's signed APT repository",
    "firefox.sh",
    true,
  ),
  brave: script("Brave's official installer", "provider.sh", true, [
    "bootstrap",
  ], ["https://dl.brave.com/install.sh", "sh"]),
  chrome: {
    ...script(
      "Google Chrome's provider DEB and update repository",
      "deb.sh",
      true,
      ["bootstrap"],
      [
        "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb",
        "google-chrome-stable",
      ],
    ),
    architectures: ["x86_64"],
  },
  docker: script(
    "Docker's official installer, or upgrade its existing packages",
    "docker.sh",
    true,
  ),
  deno: script("Deno's official installer", "provider.sh", false, [
    "bootstrap",
    "shell",
  ], ["https://deno.land/install.sh", "sh", "--yes", "--no-modify-path"]),
  hj: script("Install the hj CLI from JSR", "hj.sh", false, ["deno"]),
  starship: script("Starship's official installer", "provider.sh", false, [
    "bootstrap",
    "shell",
  ], [
    "https://starship.rs/install.sh",
    "sh",
    "--yes",
    "--bin-dir",
    "@HOME@/.local/bin",
  ]),
  node: script(
    "Current nvm release, Node LTS and current, matching local update-all",
    "node.sh",
    false,
    ["bootstrap", "shell"],
  ),
  nvm: script(
    "Install or update nvm using its current release installer",
    "node.sh",
    false,
    ["bootstrap", "shell"],
    ["nvm-only"],
  ),
  rust: script(
    "Rustup's official installer, or update installed toolchains",
    "rust.sh",
    false,
    ["build-tools", "shell"],
  ),
  "build-tools": apt(
    "Native build tools",
    "build-essential",
    "cmake",
    "pkg-config",
    "libssl-dev",
  ),
  java: apt("Ubuntu's default supported JDK", "default-jdk"),
  brew: script("Homebrew's official installer", "brew.sh", false, [
    "build-tools",
    "shell",
  ]),
  sdkman: script("SDKMAN's official installer and self-update", "sdkman.sh"),
  "sdkman-java": script("SDKMAN's recommended Java", "sdkman-java.sh", false, [
    "sdkman",
  ]),
  code: script(
    "Visual Studio Code from Microsoft's release endpoint",
    "code.sh",
    true,
  ),
  idea: script(
    "IntelliJ IDEA from JetBrains release metadata",
    "jetbrains.sh",
    false,
    ["jetbrains-packages", "shell"],
    ["IIU", "idea", "IntelliJ IDEA"],
  ),
  webstorm: script(
    "WebStorm from JetBrains release metadata",
    "jetbrains.sh",
    false,
    ["jetbrains-packages", "shell"],
    ["WS", "webstorm", "WebStorm"],
  ),
  "jetbrains-toolbox": script(
    "JetBrains Toolbox from release metadata",
    "jetbrains.sh",
    false,
    ["jetbrains-packages", "shell"],
    ["TBA", "jetbrains-toolbox", "JetBrains Toolbox"],
  ),
  "jetbrains-packages": apt(
    "JetBrains desktop dependencies",
    "libfuse2t64",
    "libxi6",
    "libxrender1",
    "libxtst6",
    "libfontconfig1",
    "libgtk-3-0t64",
    "libnss3",
    "libasound2t64",
    "desktop-file-utils",
  ),
  "signal-desktop": {
    ...script(
      "Signal's provider-maintained APT source file",
      "signal.sh",
      true,
    ),
    architectures: ["x86_64"],
  },
  mullvad: script("Mullvad's latest provider DEB", "mullvad.sh", true),
  keybase: {
    ...script("Keybase's provider DEB", "deb.sh", true, ["bootstrap"], [
      "https://prerelease.keybase.io/keybase_amd64.deb",
      "keybase",
    ]),
    architectures: ["x86_64"],
  },
  minecraft: {
    ...script(
      "Mojang's Minecraft launcher DEB",
      "deb.sh",
      true,
      ["bootstrap"],
      [
        "https://launcher.mojang.com/download/Minecraft.deb",
        "minecraft-launcher",
      ],
    ),
    architectures: ["x86_64"],
  },
  pass: script(
    "Pass, OTP support, and native Firefox integration",
    "pass.sh",
    false,
    ["pass-packages", "firefox"],
  ),
  "pass-packages": apt(
    "Pass and OTP support",
    "pass",
    "pass-extension-otp",
    "python3",
  ),
  "upgrade-os-packages": script(
    "Upgrade APT packages without removing unrelated software",
    "upgrade.sh",
    true,
  ),
};

export const aliases: Record<string, string> = {
  "all-1-minimal-sanity": "base",
  "all-2-developer-base": "developer",
  "all-3-developer-web": "web",
  "all-4-developer-java": "java-development",
  "all-5-personal": "personal",
  "all-6-gaming": "gaming",
  "firefox-local": "firefox",
  "bash": "shell",
  "add-home-bin-to-path": "shell",
  "add-node-modules-bin-to-path": "shell",
  "save-bash-history": "shell",
  "gsettings-all": "gnome-settings",
};
catalog["java-development"] = group("Java development", "java", "idea");
