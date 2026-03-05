import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { AppEnv } from "../app.js";
import { authMiddleware, orgMiddleware } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { posts, postTargets, socialAccounts } from "@socialflow/db/schema";
import { PLATFORMS, POST_STATUSES } from "@socialflow/shared";
import { publishQueue } from "../lib/queue.js";

const platformVariantSchema = z.object({
  platform: z.enum(PLATFORMS),
  content: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

const createPostBody = z.object({
  content: z.string().min(1, "Content is required"),
  platformVariants: z.array(platformVariantSchema).optional(),
  targetAccountIds: z.array(z.string()).min(1, "At least one target account is required"),
  scheduledAt: z.string().datetime().optional(),
  useQueue: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const updatePostBody = z.object({
  content: z.string().min(1).optional(),
  platformVariants: z.array(platformVariantSchema).optional(),
  targetAccountIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  status: z.enum(POST_STATUSES).optional(),
  tags: z.array(z.string()).optional(),
});

export const postsRouter = new Hono<AppEnv>();

postsRouter.use("*", authMiddleware, orgMiddleware);

// List posts
postsRouter.get("/", async (c) => {
  const orgId = c.get("organizationId");
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.organizationId, orgId))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  return c.json({ success: true, data: result });
});

// Get single post with targets
postsRouter.get("/:id", async (c) => {
  const postId = c.req.param("id");
  const orgId = c.get("organizationId");

  const post = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.organizationId, orgId)))
    .limit(1);

  if (!post.length) {
    return c.json({ success: false, error: "Post not found" }, 404);
  }

  const targets = await db
    .select()
    .from(postTargets)
    .where(eq(postTargets.postId, postId));

  return c.json({ success: true, data: { ...post[0], targets } });
});

// Create post
postsRouter.post("/", zValidator("json", createPostBody), async (c) => {
  const body = c.req.valid("json");
  const userId = c.get("userId");
  const orgId = c.get("organizationId");

  const postId = nanoid();
  const status = body.scheduledAt ? "scheduled" : body.useQueue ? "queued" : "draft";

  // Verify all target accounts belong to the organization
  const targetAccounts = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.organizationId, orgId),
        eq(socialAccounts.isActive, true)
      )
    );

  const validAccountIds = new Set(targetAccounts.map((a: { id: string }) => a.id));
  const invalidIds = body.targetAccountIds.filter((id: string) => !validAccountIds.has(id));
  if (invalidIds.length > 0) {
    return c.json({ success: false, error: "Invalid target account IDs" }, 400);
  }

  // Create post
  const [newPost] = await db
    .insert(posts)
    .values({
      id: postId,
      organizationId: orgId,
      createdBy: userId,
      content: body.content,
      platformVariants: body.platformVariants || [],
      status,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      tags: body.tags || [],
    })
    .returning();

  // Create post targets
  const targetValues = body.targetAccountIds.map((accountId: string) => {
    const account = targetAccounts.find((a: { id: string }) => a.id === accountId)!;
    return {
      id: nanoid(),
      postId,
      socialAccountId: accountId,
      platform: account.platform,
      status: "pending" as const,
    };
  });

  await db.insert(postTargets).values(targetValues);

  // Schedule for publishing if needed
  if (status === "scheduled" && body.scheduledAt) {
    const delay = new Date(body.scheduledAt).getTime() - Date.now();
    await publishQueue.add(
      "publish",
      { postId },
      { delay: Math.max(delay, 0), jobId: `post-${postId}` }
    );
  }

  return c.json({ success: true, data: newPost }, 201);
});

// Update post
postsRouter.patch("/:id", zValidator("json", updatePostBody), async (c) => {
  const postId = c.req.param("id");
  const orgId = c.get("organizationId");
  const body = c.req.valid("json");

  const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
  if (body.scheduledAt) {
    updateData.scheduledAt = new Date(body.scheduledAt);
  }
  delete updateData.targetAccountIds;

  const [updated] = await db
    .update(posts)
    .set(updateData)
    .where(and(eq(posts.id, postId), eq(posts.organizationId, orgId)))
    .returning();

  if (!updated) {
    return c.json({ success: false, error: "Post not found" }, 404);
  }

  return c.json({ success: true, data: updated });
});

// Delete post
postsRouter.delete("/:id", async (c) => {
  const postId = c.req.param("id");
  const orgId = c.get("organizationId");

  const [deleted] = await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.organizationId, orgId)))
    .returning();

  if (!deleted) {
    return c.json({ success: false, error: "Post not found" }, 404);
  }

  // Remove scheduled job if exists
  const job = await publishQueue.getJob(`post-${postId}`);
  if (job) await job.remove();

  return c.json({ success: true, message: "Post deleted" });
});
