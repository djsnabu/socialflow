import { BaseSocialProvider } from "./base.provider.js";
import type { PublishResult, SocialProfile, TokenSet } from "@socialflow/shared/types";

export class XProvider extends BaseSocialProvider {
  readonly platform = "x";

  getAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.X_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: "tweet.read tweet.write users.read offline.access",
      state,
      code_challenge: state, // Simplified — use proper PKCE in production
      code_challenge_method: "plain",
    });
    return `https://twitter.com/i/oauth2/authorize?${params}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenSet> {
    const data = await this.fetchJson<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: "challenge", // Simplified
      }),
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenSet> {
    const data = await this.fetchJson<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    };
  }

  async publishPost(token: string, content: string): Promise<PublishResult> {
    try {
      const data = await this.fetchJson<{ data: { id: string } }>(
        "https://api.twitter.com/2/tweets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: content }),
        }
      );

      return {
        success: true,
        platformPostId: data.data.id,
        platformPostUrl: `https://x.com/i/status/${data.data.id}`,
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
      data: { id: string; username: string; name: string; profile_image_url?: string };
    }>("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      platformAccountId: data.data.id,
      username: data.data.username,
      displayName: data.data.name,
      avatarUrl: data.data.profile_image_url || null,
      accountType: "personal",
      meta: {},
    };
  }
}
