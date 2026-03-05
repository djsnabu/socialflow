import { z } from "zod";
import { PLATFORMS, POST_STATUSES } from "../constants";

export const platformVariantSchema = z.object({
  platform: z.enum(PLATFORMS),
  content: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

export const createPostSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platformVariants: z.array(platformVariantSchema).optional(),
  targetAccountIds: z.array(z.string().uuid()).min(1, "At least one target account is required"),
  scheduledAt: z.string().datetime().optional(),
  useQueue: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).optional(),
  platformVariants: z.array(platformVariantSchema).optional(),
  targetAccountIds: z.array(z.string().uuid()).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  status: z.enum(POST_STATUSES).optional(),
  tags: z.array(z.string()).optional(),
});
