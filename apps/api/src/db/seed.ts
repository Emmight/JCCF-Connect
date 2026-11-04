import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { administrations } from "./schema.js";

async function seed() {
  console.log("🌱 Seeding JCCF Connect database...");

  const existingAdministration = await db
    .select()
    .from(administrations)
    .where(eq(administrations.slug, "supernatural-speed"))
    .limit(1);

  if (existingAdministration.length > 0) {
    console.log("Supernatural Speed administration already exists.");
    return;
  }

  await db.insert(administrations).values({
    name: "Supernatural Speed",
    slug: "supernatural-speed",
    description: "The current administration of JCCF Unioffa.",
    status: "current",
    isFeatured: true,
  });

  console.log("✅ Supernatural Speed administration created.");
}

seed()
  .catch((error) => {
    console.error("❌ Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });