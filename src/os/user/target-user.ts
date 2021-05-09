import { parsePasswd, PasswdEntry } from "../../deps.ts";
import { ensureSuccessfulStdOut } from "../exec.ts";

const byUid = (a: PasswdEntry, b: PasswdEntry) => a?.uid - b?.uid;

const getUsers = async () =>
  parsePasswd(await ensureSuccessfulStdOut(ROOT, ["getent", "passwd"]))
    .sort(byUid);

const SUDO_USER = "SUDO_USER";

export const ROOT: PasswdEntry = {
  uid: 0,
  gid: 0,
  username: "root",
  homedir: "/root",
};

const getTargetUser = async (): Promise<PasswdEntry> => {
  const users: Array<PasswdEntry> = await getUsers();
  const sudoUser: string | undefined = Deno.env.get(
    SUDO_USER,
  );
  if (sudoUser) {
    const targetUser: PasswdEntry | undefined = users.find((
      { username },
    ) => username === sudoUser);

    if (targetUser) {
      return targetUser;
    }
    throw new Error(
      `ERROR: Could not find requested ${SUDO_USER} "${sudoUser}".`,
    );
  }

  throw new Error(
    `ERROR: No target user found. Log in graphically as the target user. Then use sudo.`,
  );
};

export const targetUser = await getTargetUser();

export const DBUS_SESSION_BUS_ADDRESS =
  `unix:path=/run/user/${targetUser.uid}/bus`;
