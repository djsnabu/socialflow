import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const socialAccounts = pgTable("social_accounts", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  platform: text("platform", {
    enum: ["x", "linkedin", "bluesky", "facebook", "instagram"],
  }).notNull(),
  platformAccountId: text("platform_account_id").notNull(),
  platformUsername: text("platform_username").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  accountType: text("account_type", {
    enum: ["personal", "page", "business"],
  })
    .notNull()
    .default("personal"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  tokenScopes: text("token_scopes")
    .array()
    .notNull()
    .default([]),
  platformMeta: jsonb("platform_meta").$type<Record<string, unknown>>().default({}),
  isActive: boolean("is_active").notNull().default(true),
  connectedBy: text("connected_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
