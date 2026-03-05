import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { socialAccounts } from "./social-accounts";

export const queueSlots = pgTable("queue_slots", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  socialAccountId: text("social_account_id")
    .notNull()
    .references(() => socialAccounts.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  timeSlot: text("time_slot").notNull(), // HH:MM format
  timezone: text("timezone").notNull().default("Europe/Helsinki"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
