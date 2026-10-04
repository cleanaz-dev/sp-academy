import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// Full admin power
export const admin = ac.newRole({
  ...adminAc.statements,
});

// Regular customer: no admin-plugin permissions
export const customer = ac.newRole({
  ...userAc.statements,
});
