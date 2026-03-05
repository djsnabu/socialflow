import { BaseSocialProvider } from "./base.provider.js";
import type { PublishResult, SocialProfile, TokenSet } from "@socialflow/shared/types";

export class LinkedInProvider extends BaseSocialProvider {
  readonly platform = "linkedin";

  getAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      state,
      scope: "openid profile email w_member_social",
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
    const data = await this.fetchJson<{
      access_token: string;
      expires_in: number;
      refresh_token?: string;
      refresh_token_expires_in?: number;
    }>("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ["openid", "profile", "email", "w_member_social"],
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenSet> {
    const data = await this.fetchJson<{
      access_token: string;
      expires_in: number;
      refresh_token: string;
    }>("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ["openid", "profile", "email", "w_member_social"],
    };
  }

  async publishPost(token: string, content: string): Promise<PublishResult> {
    try {
      // First get the person URN
      const profile = await this.fetchJson<{ sub: string }>(
        "https://api.linkedin.com/v2/userinfo",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await this.fetchJson<{ id: string }>(
        "https://api.linkedin.com/rest/posts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author: `urn:li:person:${profile.sub}`,
            commentary: content,
            visibility: "PUBLIC",
            distribution: {
              feedDistribution: "MAIN_FEED",
            },
            lifecycleState: "PUBLISHED",
          }),
        }
      );

      return {
        success: true,
        platformPostId: data.id,
        platformPostUrl: `https://www.linkedin.com/feed/update/${data.id}`,
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
      sub: string;
      name: string;
      email: string;
      picture?: string;
    }>("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      platformAccountId: data.sub,
      username: data.email,
      displayName: data.name,
      avatarUrl: data.picture || null,
      accountType: "personal",
      meta: {},
    };
  }
}
