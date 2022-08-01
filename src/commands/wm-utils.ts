import { Exec } from "./exec.ts";
import { InstallOsPackage } from "./common/os-package.ts";
import { ROOT } from "../os/user/target-user.ts";
import { FileSystemPath, OS_PACKAGE_SYSTEM } from "../model/dependency.ts";

const spvkgnPpa = new Exec(
  [InstallOsPackage.of("software-properties-common")],
  [
    OS_PACKAGE_SYSTEM,
    ...[
      "/etc/apt/sources.list.d/spvkgn-ubuntu-ppa-jammy.list",
      "/etc/apt/sources.list.d/spvkgn-ubuntu-ppa-focal.list",
      "/etc/apt/preferences.d/99spvkgn-repository",
    ].map((path) => FileSystemPath.of(ROOT, path)),
  ],
  ROOT,
  {},
  [
    "bash",
    "-c",
    `
set -euo pipefail
IFS=$'\\t\\n'

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
  `,
  ],
);

export const wmUtils = InstallOsPackage.of("wmutils-core")
  .withDependencies([spvkgnPpa]);
