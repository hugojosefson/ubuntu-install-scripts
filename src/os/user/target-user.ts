import { parsePasswd, PasswdEntry } from "../../deps.ts";
import { ensureSuccessfulStdOut } from "../exec.ts";

const byUid = (a: PasswdEntry, b: PasswdEntry) => a?.uid - b?.uid;

const getUsers = async () =>
  parsePasswd(await ensureSuccessfulStdOut(["getent", "passwd"]))
    .sort(byUid);

export const ENV_TARGET_USER = "TARGET_USER";
const UID_MIN_INCLUSIVE = 1000;
const UID_MAX_EXCLUSIVE = 32000;
const GID_MIN_INCLUSIVE = 1000;
const GID_MAX_EXCLUSIVE = 32000;

export const ROOT: PasswdEntry = {
  uid: 0,
  gid: 0,
  username: "root",
  homedir: "/root",
};

export const getTargetUser = async (): Promise<PasswdEntry> => {
  const users: Array<PasswdEntry> = await getUsers();
  const requestedTargetUserName: string | undefined = Deno.env.get(
    ENV_TARGET_USER,
  );
  if (requestedTargetUserName) {
    const requestedTargetUser: PasswdEntry | undefined = users.find((
      { username },
    ) => username === requestedTargetUserName);

    if (requestedTargetUser) {
      return requestedTargetUser;
    }
    throw new Error(
      `ERROR: Could not find requested ${ENV_TARGET_USER} "${requestedTargetUserName}".`,
    );
  }
  const firstWithSensibleUidGid: PasswdEntry | undefined = users.find((
    { uid, gid },
  ) =>
    uid >= UID_MIN_INCLUSIVE && uid < UID_MAX_EXCLUSIVE &&
    gid >= GID_MIN_INCLUSIVE && gid < GID_MAX_EXCLUSIVE
  );
  if (firstWithSensibleUidGid) {
    return firstWithSensibleUidGid;
  }
  throw new Error(
    `ERROR: No target user found. Create a user with ${UID_MIN_INCLUSIVE} >= uid > ${UID_MAX_EXCLUSIVE} && ${GID_MIN_INCLUSIVE} >= gid > ${GID_MAX_EXCLUSIVE}, or override with env variable ${ENV_TARGET_USER}.`,
  );
};
