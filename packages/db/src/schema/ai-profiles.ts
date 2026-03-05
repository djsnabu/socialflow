import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const aiProfiles = pgTable("ai_profiles", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  toneKeywords: text("tone_keywords").array().notNull().default([]),
  examplePosts: text("example_posts").array().notNull().default([]),
  targetAudience: text("target_audience"),
  language: text("language").notNull().default("fi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
