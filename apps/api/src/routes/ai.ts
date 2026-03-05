import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppEnv } from "../app.js";
import { authMiddleware, orgMiddleware } from "../middleware/auth.js";
import { AIService } from "../services/ai.service.js";
import { PLATFORMS, AI_MODELS } from "@socialflow/shared";

const generateBody = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "At least one platform is required"),
  brandVoiceId: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().default("fi"),
  model: z.enum(AI_MODELS).default("claude-sonnet"),
});

export const aiRouter = new Hono<AppEnv>();

aiRouter.use("*", authMiddleware, orgMiddleware);

// Generate content for platforms
aiRouter.post("/generate", zValidator("json", generateBody), async (c) => {
  const body = c.req.valid("json");

  const aiService = new AIService();
  const result = await aiService.generateContent(body);

  return c.json({ success: true, data: result });
});

// Improve existing content
aiRouter.post("/improve", async (c) => {
  const body = await c.req.json<{ content: string; instruction: string; platform?: string }>();

  const aiService = new AIService();
  const result = await aiService.improveContent(body.content, body.instruction, body.platform);

  return c.json({ success: true, data: result });
});

// Generate hashtags
aiRouter.post("/hashtags", async (c) => {
  const body = await c.req.json<{ content: string; platform: string; count?: number }>();

  const aiService = new AIService();
  const hashtags = await aiService.generateHashtags(body.content, body.platform, body.count);

  return c.json({ success: true, data: { hashtags } });
});
