import { db } from "../index.js";
import type { NewUser} from "../schema.js";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  
    return result;
}

export async function deleteUsers() {
  await db
    .delete(users)
    .execute();
}

export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return user[0];
}

export async function updateUser(userId: string, email: string, hashedPassword: string) {
  const [result] = await db
    .update(users)
    .set({
        email, 
        hashedPassword,
    })
    .where(eq(users.id, userId))
    .returning();
  
    return result;
}

export async function upgradeUser(userId: string) {
  const [result] = await db
    .update(users)
    .set({
        isChirpyRed: true,
    })
    .where(eq(users.id, userId))
    .returning();

  return result;
}