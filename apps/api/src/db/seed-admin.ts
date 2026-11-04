import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "./index.js";
import { adminUsers } from "./schema.js";

async function seedAdmin() {
  const fullName = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!fullName || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured."
    );
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error("Administrator password must be 12–128 characters.");
  }

  console.log("Creating initial administrator...");

  const existingUser = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    console.log("An administrator with this email already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(adminUsers).values({
    fullName,
    email,
    passwordHash,
    role: "super_admin",
    status: "active",
  });

  console.log("Initial administrator created successfully.");
  console.log(`Administrator email: ${email}`);
}

seedAdmin()
  .catch((error) => {
    console.error("Administrator setup failed:", error);
    process.exitCode = 1;
  });