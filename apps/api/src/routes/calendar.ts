import { Hono } from "hono";
import { eq, and, gte, lte } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { authMiddleware, orgMiddleware } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { posts, postTargets } from "@socialflow/db/schema";

export const calendarRouter = new Hono<AppEnv>();

calendarRouter.use("*", authMiddleware, orgMiddleware);

// Get posts for calendar view (date range)
calendarRouter.get("/", async (c) => {
  const orgId = c.get("organizationId");
  const from = c.req.query("from");
  const to = c.req.query("to");

  if (!from || !to) {
    return c.json({ success: false, error: "from and to query params required" }, 400);
  }

  const result = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.organizationId, orgId),
        gte(posts.scheduledAt, new Date(from)),
        lte(posts.scheduledAt, new Date(to))
      )
    );

  return c.json({ success: true, data: result });
});
