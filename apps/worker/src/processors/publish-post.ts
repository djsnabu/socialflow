import type { Job } from "bullmq";
import { eq, and } from "drizzle-orm";
import { createDb } from "@socialflow/db";
import { posts, postTargets, socialAccounts } from "@socialflow/db/schema";
import { getProvider } from "../providers/index.js";
import type { Platform } from "@socialflow/shared";

const db = createDb(process.env.DATABASE_URL!);

interface PublishJobData {
  postId: string;
}

export async function processPublishPost(job: Job<PublishJobData>) {
  const { postId } = job.data;
  console.log(`Publishing post ${postId}`);

  // Get post with targets
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    throw new Error(`Post ${postId} not found`);
  }

  if (post.status === "published" || post.status === "cancelled") {
    console.log(`Post ${postId} already ${post.status}, skipping`);
    return;
  }

  // Update post status to publishing
  await db
    .update(posts)
    .set({ status: "publishing", updatedAt: new Date() })
    .where(eq(posts.id, postId));

  // Get all pending targets
  const targets = await db
    .select()
    .from(postTargets)
    .where(and(eq(postTargets.postId, postId), eq(postTargets.status, "pending")));

  let allSucceeded = true;
  let anySucceeded = false;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    // Update target status
    await db
      .update(postTargets)
      .set({ status: "publishing" })
      .where(eq(postTargets.id, target.id));

    try {
      // Get social account with token
      const [account] = await db
        .select()
        .from(socialAccounts)
        .where(eq(socialAccounts.id, target.socialAccountId))
        .limit(1);

      if (!account) {
        throw new Error(`Social account ${target.socialAccountId} not found`);
      }

      // Get platform-specific content
      const variants = post.platformVariants as Array<{
        platform: string;
        content: string;
        hashtags: string[];
      }>;
      const variant = variants?.find((v) => v.platform === target.platform);
      let content = variant?.content || post.content;

      // Append hashtags if present
      if (variant?.hashtags?.length) {
        content += "\n\n" + variant.hashtags.map((h) => `#${h}`).join(" ");
      }

      // Publish via provider
      const provider = getProvider(target.platform as Platform);
      const result = await provider.publishPost(account.accessToken, content);

      if (result.success) {
        await db
          .update(postTargets)
          .set({
            status: "published",
            platformPostId: result.platformPostId || null,
            platformPostUrl: result.platformPostUrl || null,
            publishedAt: new Date(),
          })
          .where(eq(postTargets.id, target.id));
        anySucceeded = true;
      } else {
        throw new Error(result.error || "Publish failed");
      }
    } catch (error) {
      allSucceeded = false;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to publish to ${target.platform}:`, errorMessage);

      await db
        .update(postTargets)
        .set({ status: "failed", errorMessage })
        .where(eq(postTargets.id, target.id));
    }

    await job.updateProgress(Math.round(((i + 1) / targets.length) * 100));
  }

  // Update post status
  const finalStatus = allSucceeded ? "published" : anySucceeded ? "published" : "failed";
  await db
    .update(posts)
    .set({
      status: finalStatus,
      publishedAt: anySucceeded ? new Date() : null,
      errorMessage: allSucceeded ? null : "Some targets failed to publish",
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  console.log(`Post ${postId} ${finalStatus}`);
}
