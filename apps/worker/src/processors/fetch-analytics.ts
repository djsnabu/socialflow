import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { createDb } from "@socialflow/db";
import { postTargets, postAnalytics } from "@socialflow/db/schema";
import { nanoid } from "nanoid";

const db = createDb(process.env.DATABASE_URL!);

interface AnalyticsJobData {
  postTargetId: string;
}

export async function processFetchAnalytics(job: Job<AnalyticsJobData>) {
  const { postTargetId } = job.data;
  console.log(`Fetching analytics for target ${postTargetId}`);

  const [target] = await db
    .select()
    .from(postTargets)
    .where(eq(postTargets.id, postTargetId))
    .limit(1);

  if (!target || !target.platformPostId) {
    console.log("Target not found or not published, skipping");
    return;
  }

  // TODO: Implement per-platform analytics fetching
  // For now, create a placeholder entry
  await db.insert(postAnalytics).values({
    id: nanoid(),
    postTargetId: target.id,
    socialAccountId: target.socialAccountId,
    impressions: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
  });

  console.log(`Analytics fetched for target ${postTargetId}`);
}
