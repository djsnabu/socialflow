import { z } from "zod";
import { PLATFORMS, AI_MODELS } from "../constants";

export const aiGenerateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "At least one platform is required"),
  brandVoiceId: z.string().uuid().optional(),
  tone: z.string().optional(),
  language: z.string().default("fi"),
  model: z.enum(AI_MODELS).default("claude-sonnet"),
});

export const brandVoiceSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  toneKeywords: z.array(z.string()),
  examplePosts: z.array(z.string()),
  targetAudience: z.string(),
});
