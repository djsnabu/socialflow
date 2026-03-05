import type { Platform, AIModel } from "../constants";

export interface AIGenerateRequest {
  prompt: string;
  platforms: Platform[];
  brandVoiceId?: string;
  tone?: string;
  language?: string;
  model?: AIModel;
}

export interface AIGenerateResponse {
  variants: AIVariant[];
  engagementScore: number;
  suggestions: string[];
}

export interface AIVariant {
  platform: Platform;
  content: string;
  hashtags: string[];
  characterCount: number;
  withinLimit: boolean;
}

export interface BrandVoice {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  toneKeywords: string[];
  examplePosts: string[];
  targetAudience: string;
  createdAt: Date;
  updatedAt: Date;
}
