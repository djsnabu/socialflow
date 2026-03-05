import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { authMiddleware, orgMiddleware } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { postAnalytics, postTargets, posts } from "@socialflow/db/schema";

export const analyticsRouter = new Hono<AppEnv>();

analyticsRouter.use("*", authMiddleware, orgMiddleware);

// Get analytics for a post
analyticsRouter.get("/post/:id", async (c) => {
  const postId = c.req.param("id");

  const targets = await db
    .select()
    .from(postTargets)
    .where(eq(postTargets.postId, postId));

  const analytics = [];
  for (const target of targets) {
    const data = await db
      .select()
      .from(postAnalytics)
      .where(eq(postAnalytics.postTargetId, target.id));
    analytics.push({ target, analytics: data });
  }

  return c.json({ success: true, data: analytics });
});

// Get overview analytics
analyticsRouter.get("/overview", async (c) => {
  // TODO: Aggregate analytics across all posts
  return c.json({
    success: true,
    data: {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagement: 0,
      topPosts: [],
    },
  });
});
