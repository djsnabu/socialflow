import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";
import { socialAccounts } from "./social-accounts";

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  platformVariants: jsonb("platform_variants")
    .$type<{ platform: string; content: string; hashtags: string[] }[]>()
    .default([]),
  status: text("status", {
    enum: ["draft", "scheduled", "queued", "publishing", "published", "failed", "cancelled"],
  })
    .notNull()
    .default("draft"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  queuePosition: integer("queue_position"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  aiPrompt: text("ai_prompt"),
  aiModel: text("ai_model"),
  engagementScore: integer("engagement_score"),
  approvalStatus: text("approval_status", {
    enum: ["none", "pending", "approved", "rejected"],
  })
    .notNull()
    .default("none"),
  tags: text("tags").array().notNull().default([]),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const postTargets = pgTable("post_targets", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  socialAccountId: text("social_account_id")
    .notNull()
    .references(() => socialAccounts.id, { onDelete: "cascade" }),
  platform: text("platform", {
    enum: ["x", "linkedin", "bluesky", "facebook", "instagram"],
  }).notNull(),
  status: text("status", {
    enum: ["pending", "publishing", "published", "failed"],
  })
    .notNull()
    .default("pending"),
  platformPostId: text("platform_post_id"),
  platformPostUrl: text("platform_post_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  errorMessage: text("error_message"),
});
