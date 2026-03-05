export const PLATFORMS = ["x", "linkedin", "bluesky", "facebook", "instagram"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const POST_STATUSES = [
  "draft",
  "scheduled",
  "queued",
  "publishing",
  "published",
  "failed",
  "cancelled",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const TARGET_STATUSES = [
  "pending",
  "publishing",
  "published",
  "failed",
] as const;
export type TargetStatus = (typeof TARGET_STATUSES)[number];

export const ACCOUNT_TYPES = ["personal", "page", "business"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const APPROVAL_STATUSES = ["none", "pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const ORGANIZATION_ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const AI_MODELS = ["claude-sonnet", "claude-haiku", "gpt-4o-mini"] as const;
export type AIModel = (typeof AI_MODELS)[number];

export const PLATFORM_LIMITS: Record<Platform, { maxChars: number; maxHashtags: number; maxMedia: number }> = {
  x: { maxChars: 280, maxHashtags: 3, maxMedia: 4 },
  linkedin: { maxChars: 3000, maxHashtags: 5, maxMedia: 9 },
  bluesky: { maxChars: 300, maxHashtags: 0, maxMedia: 4 },
  facebook: { maxChars: 63206, maxHashtags: 5, maxMedia: 10 },
  instagram: { maxChars: 2200, maxHashtags: 30, maxMedia: 10 },
};
