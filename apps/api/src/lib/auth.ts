import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import {
  users,
  sessions,
  accounts,
  verifications,
  organizations,
  members,
  invitations,
} from "@socialflow/db";

export const auth = betterAuth({
  basePath: "/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      organization: organizations,
      member: members,
      invitation: invitations,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [organization()],
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});
