import { db } from "../index.js";
import { users, type NewRefreshToken } from "../schema.js";
import { refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .returning();
  return result;
}

export async function getUserFromRefreshToken(refreshToken: string) {
    const result = await db
        .select()
        .from(refreshTokens)
        .innerJoin(users, eq(refreshTokens.userId, users.id))
        .where(eq(refreshTokens.token, refreshToken))
    const [row] = result;
    return row;
}