import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../app.js";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { socialAccounts } from "@socialflow/db/schema";
import { eq, and } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const API_URL = process.env.BETTER_AUTH_URL || "http://localhost:3001";

export const oauthCallbackRouter = new Hono<AppEnv>();

// ─── Helper: consume OAuth state from Redis ─────────────────────
async function getOAuthState(state: string) {
  const raw = await redis.get(`oauth:state:${state}`);
  if (!raw) return null;
  await redis.del(`oauth:state:${state}`);
  return JSON.parse(raw) as { userId: string; orgId: string; platform: string; codeVerifier: string };
}

// ─── OAuth Start (requires auth) ───────────────────────────────
oauthCallbackRouter.get("/start/:platform", authMiddleware, async (c) => {
  const platform = c.req.param("platform");
  const orgId = c.req.query("orgId");
  const userId = c.get("userId");

  if (!orgId) {
    return c.json({ success: false, error: "orgId query parameter required" }, 400);
  }

  const state = nanoid(32);
  const codeVerifier = nanoid(43); // For PKCE

  // Store state in Redis (expires in 10 minutes)
  await redis.setex(
    `oauth:state:${state}`,
    600,
    JSON.stringify({ userId, orgId, platform, codeVerifier })
  );

  const redirectUri = `${API_URL}/oauth/callback/${platform}`;
  let authUrl: string;

  switch (platform) {
    case "x": {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.X_CLIENT_ID!,
        redirect_uri: redirectUri,
        scope: "tweet.read tweet.write users.read offline.access",
        state,
        code_challenge: codeVerifier,
        code_challenge_method: "plain",
      });
      authUrl = `https://twitter.com/i/oauth2/authorize?${params}`;
      break;
    }
    case "linkedin": {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        redirect_uri: redirectUri,
        state,
        scope: "openid profile email w_member_social",
      });
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
      break;
    }
    case "facebook": {
      const params = new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        redirect_uri: redirectUri,
        state,
        scope: "email,public_profile,pages_show_list,pages_read_engagement",
        response_type: "code",
      });
      authUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
      break;
    }
    case "instagram": {
      const params = new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        redirect_uri: redirectUri,
        state,
        scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
        response_type: "code",
      });
      authUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
      break;
    }
    default:
      return c.json({ success: false, error: "Unsupported platform" }, 400);
  }

  return c.json({ success: true, authUrl });
});

// ─── Helper: save social account ───────────────────────────────
async function saveSocialAccount(opts: {
  userId: string;
  orgId: string;
  platform: string;
  platformAccountId: string;
  platformUsername: string;
  displayName: string;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  scopes: string[];
  accountType?: string;
}) {
  type SocialPlatform = "x" | "linkedin" | "bluesky" | "facebook" | "instagram";
  const platform = opts.platform as SocialPlatform;

  // Check if account already connected to this org
  const existing = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.organizationId, opts.orgId),
        eq(socialAccounts.platform, platform),
        eq(socialAccounts.platformAccountId, opts.platformAccountId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(socialAccounts)
      .set({
        accessToken: opts.accessToken,
        refreshToken: opts.refreshToken,
        tokenExpiresAt: opts.expiresIn ? new Date(Date.now() + opts.expiresIn * 1000) : null,
        scopes: opts.scopes,
        updatedAt: new Date(),
      })
      .where(eq(socialAccounts.id, existing[0].id))
      .returning();
    return updated;
  }

  const [account] = await db
    .insert(socialAccounts)
    .values({
      id: nanoid(),
      organizationId: opts.orgId,
      platform,
      platformAccountId: opts.platformAccountId,
      platformUsername: opts.platformUsername,
      displayName: opts.displayName,
      avatarUrl: opts.avatarUrl,
      accessToken: opts.accessToken,
      refreshToken: opts.refreshToken,
      tokenExpiresAt: opts.expiresIn ? new Date(Date.now() + opts.expiresIn * 1000) : null,
      scopes: opts.scopes,
      accountType: (opts.accountType || "personal") as "personal" | "page" | "business",
      connectedBy: opts.userId,
    })
    .returning();

  return account;
}

// ─── X (Twitter) OAuth 2.0 PKCE callback ──────────────────────
oauthCallbackRouter.get("/callback/x", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.redirect(`${APP_URL}/accounts?error=missing_params`);
  }

  try {
    const stateData = await getOAuthState(state);
    if (!stateData) {
      return c.redirect(`${APP_URL}/accounts?error=invalid_state`);
    }
    const { userId, orgId, codeVerifier } = stateData;

    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: process.env.X_CLIENT_ID!,
        redirect_uri: `${API_URL}/oauth/callback/x`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("X token exchange failed:", await tokenResponse.text());
      throw new Error("Token exchange failed");
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const profileResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const profile = (await profileResponse.json()) as {
      data: { id: string; username: string; name: string; profile_image_url?: string };
    };

    await saveSocialAccount({
      userId,
      orgId,
      platform: "x",
      platformAccountId: profile.data.id,
      platformUsername: profile.data.username,
      displayName: profile.data.name,
      avatarUrl: profile.data.profile_image_url || null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    });

    return c.redirect(`${APP_URL}/accounts?connected=x`);
  } catch (error) {
    console.error("X OAuth error:", error);
    return c.redirect(`${APP_URL}/accounts?error=x_oauth_failed`);
  }
});

// ─── LinkedIn OAuth 2.0 callback ──────────────────────────────
oauthCallbackRouter.get("/callback/linkedin", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.redirect(`${APP_URL}/accounts?error=missing_params`);
  }

  try {
    const stateData = await getOAuthState(state);
    if (!stateData) {
      return c.redirect(`${APP_URL}/accounts?error=invalid_state`);
    }
    const { userId, orgId } = stateData;

    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${API_URL}/oauth/callback/linkedin`,
      }),
    });

    if (!tokenResponse.ok) throw new Error("Token exchange failed");

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileResponse.json()) as {
      sub: string;
      name: string;
      email: string;
      picture?: string;
    };

    await saveSocialAccount({
      userId,
      orgId,
      platform: "linkedin",
      platformAccountId: profile.sub,
      platformUsername: profile.email,
      displayName: profile.name,
      avatarUrl: profile.picture || null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresIn: tokens.expires_in,
      scopes: ["openid", "profile", "email", "w_member_social"],
    });

    return c.redirect(`${APP_URL}/accounts?connected=linkedin`);
  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return c.redirect(`${APP_URL}/accounts?error=linkedin_oauth_failed`);
  }
});

// ─── Meta (Facebook) OAuth callback ───────────────────────────
oauthCallbackRouter.get("/callback/facebook", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.redirect(`${APP_URL}/accounts?error=missing_params`);
  }

  try {
    const stateData = await getOAuthState(state);
    if (!stateData) {
      return c.redirect(`${APP_URL}/accounts?error=invalid_state`);
    }
    const { userId, orgId } = stateData;

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&redirect_uri=${encodeURIComponent(`${API_URL}/oauth/callback/facebook`)}&code=${code}`
    );
    if (!tokenResponse.ok) throw new Error("Token exchange failed");
    const shortToken = (await tokenResponse.json()) as { access_token: string; expires_in: number };

    const longTokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortToken.access_token}`
    );
    const longToken = longTokenResponse.ok
      ? ((await longTokenResponse.json()) as { access_token: string; expires_in: number })
      : shortToken;

    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=id,name,picture&access_token=${longToken.access_token}`
    );
    const profile = (await profileResponse.json()) as {
      id: string;
      name: string;
      picture?: { data?: { url: string } };
    };

    await saveSocialAccount({
      userId,
      orgId,
      platform: "facebook",
      platformAccountId: profile.id,
      platformUsername: profile.name,
      displayName: profile.name,
      avatarUrl: profile.picture?.data?.url || null,
      accessToken: longToken.access_token,
      refreshToken: null,
      expiresIn: longToken.expires_in,
      scopes: ["pages_manage_posts", "pages_read_engagement"],
      accountType: "page",
    });

    return c.redirect(`${APP_URL}/accounts?connected=facebook`);
  } catch (error) {
    console.error("Facebook OAuth error:", error);
    return c.redirect(`${APP_URL}/accounts?error=facebook_oauth_failed`);
  }
});

// ─── Meta (Instagram) OAuth callback ──────────────────────────
oauthCallbackRouter.get("/callback/instagram", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) {
    return c.redirect(`${APP_URL}/accounts?error=missing_params`);
  }

  try {
    const stateData = await getOAuthState(state);
    if (!stateData) {
      return c.redirect(`${APP_URL}/accounts?error=invalid_state`);
    }
    const { userId, orgId } = stateData;

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&redirect_uri=${encodeURIComponent(`${API_URL}/oauth/callback/instagram`)}&code=${code}`
    );
    if (!tokenResponse.ok) throw new Error("Token exchange failed");
    const tokens = (await tokenResponse.json()) as { access_token: string; expires_in: number };

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${tokens.access_token}`
    );
    const pages = (await pagesResponse.json()) as {
      data: Array<{ id: string; name: string; access_token: string }>;
    };

    // Check all pages in parallel for linked Instagram business accounts
    const results = await Promise.all(
      (pages.data || []).map(async (page) => {
        const igResponse = await fetch(
          `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = (await igResponse.json()) as {
          instagram_business_account?: { id: string };
        };
        if (!igData.instagram_business_account) return null;

        const igProfile = (await (
          await fetch(
            `https://graph.facebook.com/v21.0/${igData.instagram_business_account.id}?fields=username,name,profile_picture_url&access_token=${page.access_token}`
          )
        ).json()) as { id: string; username: string; name?: string; profile_picture_url?: string };

        return { page, igData, igProfile };
      })
    );

    const found = results.find((r) => r !== null);
    if (!found) {
      return c.redirect(`${APP_URL}/accounts?error=no_instagram_account`);
    }

    const { page, igData, igProfile } = found;
    await saveSocialAccount({
      userId,
      orgId,
      platform: "instagram",
      platformAccountId: igData.instagram_business_account!.id,
      platformUsername: igProfile.username,
      displayName: igProfile.name || igProfile.username,
      avatarUrl: igProfile.profile_picture_url || null,
      accessToken: page.access_token,
      refreshToken: null,
      expiresIn: null,
      scopes: ["instagram_basic", "instagram_content_publish"],
      accountType: "business",
    });

    return c.redirect(`${APP_URL}/accounts?connected=instagram`);
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    return c.redirect(`${APP_URL}/accounts?error=instagram_oauth_failed`);
  }
});

// ─── Bluesky (AT Protocol — no OAuth) ─────────────────────────
oauthCallbackRouter.post("/connect/bluesky", authMiddleware, async (c) => {
  const body = await c.req.json<{ handle: string; appPassword: string }>();
  const userId = c.get("userId");
  const orgId = c.req.header("x-organization-id");

  if (!orgId) {
    return c.json({ success: false, error: "Organization required" }, 400);
  }

  try {
    const sessionResponse = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: body.handle, password: body.appPassword }),
    });

    if (!sessionResponse.ok) {
      throw new Error("Bluesky authentication failed");
    }

    const session = (await sessionResponse.json()) as {
      did: string;
      handle: string;
      accessJwt: string;
      refreshJwt: string;
    };

    const account = await saveSocialAccount({
      userId,
      orgId,
      platform: "bluesky",
      platformAccountId: session.did,
      platformUsername: session.handle,
      displayName: session.handle,
      avatarUrl: null,
      accessToken: session.accessJwt,
      refreshToken: session.refreshJwt,
      expiresIn: null,
      scopes: [],
    });

    return c.json({ success: true, data: account });
  } catch (error) {
    console.error("Bluesky connect error:", error);
    return c.json({ success: false, error: "Failed to connect Bluesky account" }, 400);
  }
});
