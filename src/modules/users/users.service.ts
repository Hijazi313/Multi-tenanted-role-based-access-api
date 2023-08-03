import { InferModel, eq } from "drizzle-orm";
import { users, usersToRoles } from "../../db/schema";
import { db } from "../../db";
import argon2 from "argon2";

export async function createUser(data: InferModel<typeof users, "insert">) {
  const hashPassword = await argon2.hash(data.password);
  const result = await db
    .insert(users)
    .values({
      ...data,
      password: hashPassword,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      applicationId: users.applicationId,
    });

  return result[0];
}

export async function getUsersByApplication(applicationId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.applicationId, applicationId));
  return result;
}

export async function assignRoleToUser(
  data: InferModel<typeof usersToRoles, "insert">
) {
  const result = await db.insert(usersToRoles).values(data).returning();
  return result[0];
}
