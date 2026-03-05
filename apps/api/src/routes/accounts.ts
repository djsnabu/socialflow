import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { authMiddleware, orgMiddleware } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { socialAccounts } from "@socialflow/db/schema";

export const accountsRouter = new Hono<AppEnv>();

accountsRouter.use("*", authMiddleware, orgMiddleware);

// List connected accounts
accountsRouter.get("/", async (c) => {
  const orgId = c.get("organizationId");
  const result = await db
    .select({
      id: socialAccounts.id,
      platform: socialAccounts.platform,
      platformUsername: socialAccounts.platformUsername,
      displayName: socialAccounts.displayName,
      avatarUrl: socialAccounts.avatarUrl,
      accountType: socialAccounts.accountType,
      isActive: socialAccounts.isActive,
      tokenExpiresAt: socialAccounts.tokenExpiresAt,
      createdAt: socialAccounts.createdAt,
    })
    .from(socialAccounts)
    .where(eq(socialAccounts.organizationId, orgId));

  return c.json({ success: true, data: result });
});

// Disconnect account
accountsRouter.delete("/:id", async (c) => {
  const accountId = c.req.param("id");
  const orgId = c.get("organizationId");

  const [deleted] = await db
    .delete(socialAccounts)
    .where(
      and(
        eq(socialAccounts.id, accountId),
        eq(socialAccounts.organizationId, orgId)
      )
    )
    .returning();

  if (!deleted) {
    return c.json({ success: false, error: "Account not found" }, 404);
  }

  return c.json({ success: true, message: "Account disconnected" });
});

// Toggle account active status
accountsRouter.patch("/:id/toggle", async (c) => {
  const accountId = c.req.param("id");
  const orgId = c.get("organizationId");

  const existing = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.id, accountId),
        eq(socialAccounts.organizationId, orgId)
      )
    )
    .limit(1);

  if (!existing.length) {
    return c.json({ success: false, error: "Account not found" }, 404);
  }

  const [updated] = await db
    .update(socialAccounts)
    .set({ isActive: !existing[0].isActive, updatedAt: new Date() })
    .where(eq(socialAccounts.id, accountId))
    .returning();

  return c.json({ success: true, data: updated });
});
