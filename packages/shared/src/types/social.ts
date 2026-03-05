import type { Platform, AccountType } from "../constants";

export interface SocialAccount {
  id: string;
  organizationId: string;
  platform: Platform;
  platformAccountId: string;
  platformUsername: string;
  displayName: string;
  avatarUrl: string | null;
  accountType: AccountType;
  tokenScopes: string[];
  platformMeta: Record<string, unknown>;
  isActive: boolean;
  connectedBy: string;
  tokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string[];
}

export interface SocialProfile {
  platformAccountId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  accountType: AccountType;
  meta: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
}
