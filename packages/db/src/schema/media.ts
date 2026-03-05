import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";
import { posts } from "./posts";

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const postMedia = pgTable("post_media", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  mediaId: text("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
});
