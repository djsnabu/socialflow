import type { Job } from "bullmq";
import { eq, lt, and } from "drizzle-orm";
import { createDb } from "@socialflow/db";
import { socialAccounts } from "@socialflow/db/schema";
import { getProvider } from "../providers/index.js";
import type { Platform } from "@socialflow/shared";

const db = createDb(process.env.DATABASE_URL!);

export async function processRefreshTokens(job: Job) {
  console.log("Checking for tokens needing refresh...");

  // Find accounts with tokens expiring in the next hour
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

  const expiringAccounts = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.isActive, true),
        lt(socialAccounts.tokenExpiresAt, oneHourFromNow)
      )
    );

  console.log(`Found ${expiringAccounts.length} tokens to refresh`);

  for (const account of expiringAccounts) {
    try {
      if (!account.refreshToken) {
        console.log(`No refresh token for ${account.platform}:${account.platformUsername}`);
        continue;
      }

      const provider = getProvider(account.platform as Platform);
      const newTokens = await provider.refreshToken(account.refreshToken);

      await db
        .update(socialAccounts)
        .set({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || account.refreshToken,
          tokenExpiresAt: newTokens.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(socialAccounts.id, account.id));

      console.log(`Refreshed token for ${account.platform}:${account.platformUsername}`);
    } catch (error) {
      console.error(
        `Failed to refresh token for ${account.platform}:${account.platformUsername}:`,
        error instanceof Error ? error.message : error
      );
    }
  }
}
