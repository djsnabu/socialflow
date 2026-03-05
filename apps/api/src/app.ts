import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { postsRouter } from "./routes/posts.js";
import { accountsRouter } from "./routes/accounts.js";
import { aiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { calendarRouter } from "./routes/calendar.js";
import { mediaRouter } from "./routes/media.js";
import { analyticsRouter } from "./routes/analytics.js";
import { oauthCallbackRouter } from "./routes/oauth-callback.js";

export type AppEnv = {
  Variables: {
    userId: string;
    organizationId: string;
  };
};

const app = new Hono<AppEnv>();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Auth routes (no auth middleware)
app.route("/auth", authRouter);
app.route("/oauth", oauthCallbackRouter);

// API routes (auth middleware applied per-router)
app.route("/api/posts", postsRouter);
app.route("/api/accounts", accountsRouter);
app.route("/api/ai", aiRouter);
app.route("/api/calendar", calendarRouter);
app.route("/api/media", mediaRouter);
app.route("/api/analytics", analyticsRouter);

export { app };
