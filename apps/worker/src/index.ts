import { Worker } from "bullmq";
import { processPublishPost } from "./processors/publish-post.js";
import { processRefreshTokens } from "./processors/refresh-tokens.js";
import { processFetchAnalytics } from "./processors/fetch-analytics.js";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
};

console.log("SocialFlow Worker starting...");

// Publish post worker
const publishWorker = new Worker("publish-post", processPublishPost, {
  connection,
  concurrency: 5,
});

publishWorker.on("completed", (job) => {
  console.log(`Post published: ${job.id}`);
});

publishWorker.on("failed", (job, err) => {
  console.error(`Post publish failed: ${job?.id}`, err.message);
});

// Token refresh worker (runs on cron)
const tokenWorker = new Worker("refresh-tokens", processRefreshTokens, {
  connection,
  concurrency: 1,
});

// Analytics fetch worker
const analyticsWorker = new Worker("fetch-analytics", processFetchAnalytics, {
  connection,
  concurrency: 2,
});

console.log("SocialFlow Worker running — listening for jobs");

// Graceful shutdown
const shutdown = async () => {
  console.log("Worker shutting down...");
  await publishWorker.close();
  await tokenWorker.close();
  await analyticsWorker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
