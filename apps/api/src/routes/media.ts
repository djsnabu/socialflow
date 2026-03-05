import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../app.js";
import { authMiddleware, orgMiddleware } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { media } from "@socialflow/db/schema";

export const mediaRouter = new Hono<AppEnv>();

mediaRouter.use("*", authMiddleware, orgMiddleware);

// List media
mediaRouter.get("/", async (c) => {
  const orgId = c.get("organizationId");
  const result = await db
    .select()
    .from(media)
    .where(eq(media.organizationId, orgId));

  return c.json({ success: true, data: result });
});

// Upload will be implemented with multipart form handling
mediaRouter.post("/upload", async (c) => {
  // TODO: Implement file upload with storage (local/S3)
  return c.json({ success: false, error: "Not yet implemented" }, 501);
});
