import { eq } from "drizzle-orm";
import { db } from "../index.js";
import {refreshTokens} from "../schema.js"

export async function revokeRefreshToken(refreshToken: string) {
    const result = await db
        .update(refreshTokens)
        .set({
            revokedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(refreshTokens.token, refreshToken))
}