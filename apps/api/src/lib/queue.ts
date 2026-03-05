import { Queue } from "bullmq";

const connection = {
  host: new URL(process.env.REDIS_URL || "redis://localhost:6379").hostname,
  port: Number(new URL(process.env.REDIS_URL || "redis://localhost:6379").port) || 6379,
};

export const publishQueue = new Queue("publish-post", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export const aiQueue = new Queue("ai-generate", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
  },
});

export const analyticsQueue = new Queue("fetch-analytics", {
  connection,
});

export const tokenRefreshQueue = new Queue("refresh-tokens", {
  connection,
});
