import { BaseSocialProvider } from "./base.provider.js";
import type { PublishResult, SocialProfile, TokenSet } from "@socialflow/shared/types";

export class InstagramProvider extends BaseSocialProvider {
  readonly platform = "instagram";
  private readonly graphUrl = "https://graph.facebook.com/v21.0";

  getAuthUrl(state: string, redirectUri: string): string {
    // Instagram uses Meta OAuth (same as Facebook)
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri,
      state,
      scope: "instagram_basic,instagram_content_publish",
      response_type: "code",
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
    const data = await this.fetchJson<{
      access_token: string;
      expires_in: number;
    }>(
      `${this.graphUrl}/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );

    return {
      accessToken: data.access_token,
      refreshToken: null,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ["instagram_basic", "instagram_content_publish"],
    };
  }

  async refreshToken(): Promise<TokenSet> {
    throw new Error("Use long-lived token exchange for Instagram");
  }

  async publishPost(token: string, content: string, mediaUrls?: string[], igUserId?: string): Promise<PublishResult> {
    try {
      if (!mediaUrls?.length) {
        return { success: false, error: "Instagram requires at least one image" };
      }

      const userId = igUserId || "me";

      // Step 1: Create media container
      const container = await this.fetchJson<{ id: string }>(
        `${this.graphUrl}/${userId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: mediaUrls[0],
            caption: content,
            access_token: token,
          }),
        }
      );

      // Step 2: Publish the container
      const published = await this.fetchJson<{ id: string }>(
        `${this.graphUrl}/${userId}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: container.id,
            access_token: token,
          }),
        }
      );

      return {
        success: true,
        platformPostId: published.id,
        platformPostUrl: `https://www.instagram.com/p/${published.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getProfile(token: string): Promise<SocialProfile> {
    const data = await this.fetchJson<{
      id: string;
      username: string;
      name?: string;
      profile_picture_url?: string;
      account_type?: string;
    }>(`${this.graphUrl}/me?fields=id,username,name,profile_picture_url,account_type&access_token=${token}`);

    return {
      platformAccountId: data.id,
      username: data.username,
      displayName: data.name || data.username,
      avatarUrl: data.profile_picture_url || null,
      accountType: data.account_type === "BUSINESS" ? "business" : "personal",
      meta: {},
    };
  }
}
