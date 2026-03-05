import { BaseSocialProvider } from "./base.provider.js";
import type { PublishResult, SocialProfile, TokenSet } from "@socialflow/shared/types";

export class FacebookProvider extends BaseSocialProvider {
  readonly platform = "facebook";
  private readonly graphUrl = "https://graph.facebook.com/v21.0";

  getAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri,
      state,
      scope: "pages_manage_posts,pages_read_engagement,pages_show_list",
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
      scopes: ["pages_manage_posts", "pages_read_engagement"],
    };
  }

  async refreshToken(): Promise<TokenSet> {
    // Facebook uses long-lived tokens, exchange short for long
    throw new Error("Use long-lived token exchange for Facebook");
  }

  async publishPost(pageToken: string, content: string, _mediaUrls?: string[], pageId?: string): Promise<PublishResult> {
    try {
      const targetPageId = pageId || "me";
      const data = await this.fetchJson<{ id: string }>(
        `${this.graphUrl}/${targetPageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            access_token: pageToken,
          }),
        }
      );

      return {
        success: true,
        platformPostId: data.id,
        platformPostUrl: `https://www.facebook.com/${data.id}`,
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
      name: string;
      picture?: { data?: { url: string } };
    }>(`${this.graphUrl}/me?fields=id,name,picture&access_token=${token}`);

    return {
      platformAccountId: data.id,
      username: data.name,
      displayName: data.name,
      avatarUrl: data.picture?.data?.url || null,
      accountType: "page",
      meta: {},
    };
  }
}
