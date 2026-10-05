import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq } from "drizzle-orm";
import { respondWithJSON } from "../../api/json.js";



export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getChirps() {
    const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
    return result;
}

export async function getChirpsById(id: string) {
    const result = await db.select().from(chirps).where(eq(chirps.id, id));
    if (result.length === 0) {
        return undefined;
    }
    return result[0];
}