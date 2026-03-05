import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { postTargets } from "./posts";
import { socialAccounts } from "./social-accounts";

export const postAnalytics = pgTable("post_analytics", {
  id: text("id").primaryKey(),
  postTargetId: text("post_target_id")
    .notNull()
    .references(() => postTargets.id, { onDelete: "cascade" }),
  socialAccountId: text("social_account_id")
    .notNull()
    .references(() => socialAccounts.id, { onDelete: "cascade" }),
  impressions: integer("impressions").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  engagementRate: text("engagement_rate"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});
