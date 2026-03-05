import type { PublishResult, SocialProfile, TokenSet } from "@socialflow/shared/types";

export interface SocialProvider {
  readonly platform: string;

  getAuthUrl(state: string, redirectUri: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<TokenSet>;
  refreshToken(refreshToken: string): Promise<TokenSet>;
  publishPost(token: string, content: string, mediaUrls?: string[]): Promise<PublishResult>;
  getProfile(token: string): Promise<SocialProfile>;
}

export abstract class BaseSocialProvider implements SocialProvider {
  abstract readonly platform: string;

  abstract getAuthUrl(state: string, redirectUri: string): string;
  abstract exchangeCode(code: string, redirectUri: string): Promise<TokenSet>;
  abstract refreshToken(refreshToken: string): Promise<TokenSet>;
  abstract publishPost(token: string, content: string, mediaUrls?: string[]): Promise<PublishResult>;
  abstract getProfile(token: string): Promise<SocialProfile>;

  protected async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${this.platform} API error (${response.status}): ${error}`);
    }
    return response.json() as Promise<T>;
  }
}
