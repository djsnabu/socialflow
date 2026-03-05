import type { Platform, PostStatus, TargetStatus, ApprovalStatus, AIModel } from "../constants";

export interface PlatformVariant {
  platform: Platform;
  content: string;
  hashtags: string[];
}

export interface Post {
  id: string;
  organizationId: string;
  createdBy: string;
  content: string;
  platformVariants: PlatformVariant[];
  status: PostStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  queuePosition: number | null;
  aiGenerated: boolean;
  aiPrompt: string | null;
  aiModel: AIModel | null;
  engagementScore: number | null;
  approvalStatus: ApprovalStatus;
  tags: string[];
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostTarget {
  id: string;
  postId: string;
  socialAccountId: string;
  platform: Platform;
  status: TargetStatus;
  platformPostId: string | null;
  platformPostUrl: string | null;
  publishedAt: Date | null;
  errorMessage: string | null;
}

export interface CreatePostInput {
  content: string;
  platformVariants?: PlatformVariant[];
  targetAccountIds: string[];
  scheduledAt?: string;
  useQueue?: boolean;
  tags?: string[];
}
