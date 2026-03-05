import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../app.js";
import { auth } from "../lib/auth.js";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  c.set("userId", session.user.id);

  // Get active organization from header or default
  const orgId = c.req.header("x-organization-id");
  if (orgId) {
    c.set("organizationId", orgId);
  }

  await next();
});

export const orgMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const organizationId = c.get("organizationId");
  if (!organizationId) {
    return c.json({ success: false, error: "Organization required" }, 400);
  }
  await next();
});
