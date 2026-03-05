import { BaseSocialProvider } from "./base.provider.js";
import type { PublishResult, SocialProfile, TokenSet } from "@socialflow/shared/types";

export class BlueskyProvider extends BaseSocialProvider {
  readonly platform = "bluesky";
  private readonly baseUrl = "https://bsky.social/xrpc";

  getAuthUrl(): string {
    // Bluesky uses AT Protocol, not OAuth
    throw new Error("Bluesky does not use OAuth. Use handle + app password.");
  }

  async exchangeCode(): Promise<TokenSet> {
    throw new Error("Bluesky does not use OAuth.");
  }

  async refreshToken(refreshJwt: string): Promise<TokenSet> {
    const data = await this.fetchJson<{
      accessJwt: string;
      refreshJwt: string;
      did: string;
    }>(`${this.baseUrl}/com.atproto.server.refreshSession`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshJwt}` },
    });

    return {
      accessToken: data.accessJwt,
      refreshToken: data.refreshJwt,
      expiresAt: null, // AT Protocol JWTs have short-lived access tokens
      scopes: [],
    };
  }

  async createSession(handle: string, appPassword: string): Promise<TokenSet & { did: string }> {
    const data = await this.fetchJson<{
      did: string;
      handle: string;
      accessJwt: string;
      refreshJwt: string;
    }>(`${this.baseUrl}/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    });

    return {
      accessToken: data.accessJwt,
      refreshToken: data.refreshJwt,
      expiresAt: null,
      scopes: [],
      did: data.did,
    };
  }

  async publishPost(token: string, content: string): Promise<PublishResult> {
    try {
      // Get the DID from the token (we need it for the repo)
      const session = await this.fetchJson<{ did: string; handle: string }>(
        `${this.baseUrl}/com.atproto.server.getSession`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Parse facets (links, mentions) from content
      const facets = this.parseFacets(content);

      const data = await this.fetchJson<{ uri: string; cid: string }>(
        `${this.baseUrl}/com.atproto.repo.createRecord`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repo: session.did,
            collection: "app.bsky.feed.post",
            record: {
              $type: "app.bsky.feed.post",
              text: content,
              facets: facets.length > 0 ? facets : undefined,
              createdAt: new Date().toISOString(),
            },
          }),
        }
      );

      // Extract rkey from URI for the post URL
      const rkey = data.uri.split("/").pop();
      return {
        success: true,
        platformPostId: data.uri,
        platformPostUrl: `https://bsky.app/profile/${session.handle}/post/${rkey}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getProfile(token: string): Promise<SocialProfile> {
    const session = await this.fetchJson<{ did: string; handle: string }>(
      `${this.baseUrl}/com.atproto.server.getSession`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const profile = await this.fetchJson<{
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    }>(`${this.baseUrl}/app.bsky.actor.getProfile?actor=${session.did}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      platformAccountId: profile.did,
      username: profile.handle,
      displayName: profile.displayName || profile.handle,
      avatarUrl: profile.avatar || null,
      accountType: "personal",
      meta: {},
    };
  }

  private parseFacets(text: string) {
    const facets: Array<{
      index: { byteStart: number; byteEnd: number };
      features: Array<{ $type: string; uri?: string }>;
    }> = [];

    // Parse URLs
    const urlRegex = /https?:\/\/[^\s)]+/g;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const byteStart = Buffer.byteLength(text.slice(0, match.index));
      const byteEnd = byteStart + Buffer.byteLength(match[0]);
      facets.push({
        index: { byteStart, byteEnd },
        features: [{ $type: "app.bsky.richtext.facet#link", uri: match[0] }],
      });
    }

    return facets;
  }
}
