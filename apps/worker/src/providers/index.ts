import type { SocialProvider } from "./base.provider.js";
import { XProvider } from "./x.provider.js";
import { LinkedInProvider } from "./linkedin.provider.js";
import { BlueskyProvider } from "./bluesky.provider.js";
import { FacebookProvider } from "./facebook.provider.js";
import { InstagramProvider } from "./instagram.provider.js";
import type { Platform } from "@socialflow/shared";

const providers: Record<string, SocialProvider> = {
  x: new XProvider(),
  linkedin: new LinkedInProvider(),
  bluesky: new BlueskyProvider(),
  facebook: new FacebookProvider(),
  instagram: new InstagramProvider(),
};

export function getProvider(platform: Platform): SocialProvider {
  const provider = providers[platform];
  if (!provider) {
    throw new Error(`No provider for platform: ${platform}`);
  }
  return provider;
}

export { type SocialProvider } from "./base.provider.js";
