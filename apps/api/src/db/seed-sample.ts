import "dotenv/config";
import { and, eq } from "drizzle-orm";

import { db } from "./index.js";
import {
  administrations,
  announcements,
  birthdayRecords,
  executives,
  mediaAssets,
  mediaRequests,
  mediaTasks,
  programmes,
  siteSettings,
} from "./schema.js";

function dateAfter(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function seedSampleData() {
  if (process.env.SEED_SAMPLE_DATA !== "true") {
    throw new Error("Sample seeding is disabled. Set SEED_SAMPLE_DATA=true to continue.");
  }

  console.log("Seeding clearly labeled sample records...");

  await db.insert(administrations).values({
    name: "Sample Current Administration",
    slug: "sample-current-administration",
    description: "Sample administration record. Replace with confirmed fellowship details.",
    status: "upcoming",
    isFeatured: false,
  }).onConflictDoNothing();

  await db.insert(administrations).values({
    name: "Sample Previous Administration",
    slug: "sample-previous-administration",
    description: "Sample archive record. Replace with confirmed fellowship details.",
    status: "upcoming",
  }).onConflictDoNothing();

  await db.update(administrations)
    .set({ status: "upcoming", isFeatured: false, updatedAt: new Date() })
    .where(eq(administrations.slug, "sample-previous-administration"));

  const [sampleAdministration] = await db.select().from(administrations)
    .where(eq(administrations.slug, "sample-current-administration")).limit(1);
  await db.update(administrations)
    .set({ status: "upcoming", isFeatured: false, updatedAt: new Date() })
    .where(eq(administrations.slug, "sample-current-administration"));

  if (sampleAdministration) {
    const sampleExecutives = [
      ["Sample Fellowship President", "President"],
      ["Sample Fellowship Vice President", "Vice President"],
      ["Sample Fellowship Secretary", "General Secretary"],
      ["Sample Fellowship Media Coordinator", "Media Coordinator"],
    ] as const;

    for (const [fullName, position] of sampleExecutives) {
      const [existing] = await db.select({ id: executives.id }).from(executives).where(and(
        eq(executives.administrationId, sampleAdministration.id),
        eq(executives.position, position),
      )).limit(1);
      if (!existing) {
        await db.insert(executives).values({
          administrationId: sampleAdministration.id,
          fullName,
          position,
          biography: "Sample profile. Replace with confirmed executive details.",
          status: "inactive",
        });
      } else {
        await db.update(executives)
          .set({ status: "inactive", updatedAt: new Date() })
          .where(and(
            eq(executives.administrationId, sampleAdministration.id),
            eq(executives.position, position),
          ));
      }
    }
  }

  const sampleProgrammes = [
    {
      title: "Sample Bible Study",
      slug: "sample-bible-study",
      category: "bible_study" as const,
      description: "Sample programme. Replace with confirmed meeting details.",
      startDate: dateAfter(7),
      startTime: "16:00",
      venue: "Sample campus venue",
      status: "draft" as const,
      isFeatured: false,
    },
    {
      title: "Sample Fellowship Gathering",
      slug: "sample-fellowship-gathering",
      category: "fellowship" as const,
      description: "Sample programme. Replace with confirmed event details.",
      startDate: dateAfter(14),
      startTime: "17:00",
      venue: "Sample campus venue",
      status: "draft" as const,
      isFeatured: false,
    },
  ];

  for (const programme of sampleProgrammes) {
    await db.insert(programmes).values(programme).onConflictDoNothing();
    await db.update(programmes)
      .set({ status: "draft", isFeatured: false, updatedAt: new Date() })
      .where(eq(programmes.slug, programme.slug));
  }

  const sampleAnnouncements = [
    {
      title: "Sample Fellowship Update",
      slug: "sample-fellowship-update",
      summary: "Sample announcement. Replace before publishing this site publicly.",
      content: "This is sample content for verifying the announcement workflow. Replace it with an approved fellowship update.",
      category: "announcement",
      status: "draft" as const,
      isFeatured: false,
    },
    {
      title: "Sample Notice",
      slug: "sample-notice",
      summary: "A sample notice for local testing.",
      content: "This is sample content. Replace it with a confirmed notice before production use.",
      category: "notice",
      status: "draft" as const,
      isFeatured: false,
    },
  ];

  for (const announcement of sampleAnnouncements) {
    await db.insert(announcements).values(announcement).onConflictDoNothing();
    await db.update(announcements)
      .set({ status: "draft", isFeatured: false, publishedAt: null, updatedAt: new Date() })
      .where(eq(announcements.slug, announcement.slug));
  }

  const sampleBirthdays = [
    { fullName: "Sample Member One", month: 2, day: 14, visibility: "private" as const },
    { fullName: "Sample Member Two", month: 6, day: 9, visibility: "private" as const },
    { fullName: "Sample Member Three", month: 10, day: 21, visibility: "private" as const },
  ];

  for (const birthday of sampleBirthdays) {
    const [existing] = await db.select({ id: birthdayRecords.id }).from(birthdayRecords).where(and(
      eq(birthdayRecords.fullName, birthday.fullName),
      eq(birthdayRecords.month, birthday.month),
      eq(birthdayRecords.day, birthday.day),
    )).limit(1);
    if (!existing) {
      await db.insert(birthdayRecords).values(birthday);
    } else {
      await db.update(birthdayRecords)
        .set({ visibility: "private", updatedAt: new Date() })
        .where(and(
          eq(birthdayRecords.fullName, birthday.fullName),
          eq(birthdayRecords.month, birthday.month),
          eq(birthdayRecords.day, birthday.day),
        ));
    }
  }

  const sampleMedia = [
    { title: "Sample Fellowship Photo", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85" },
    { title: "Sample Worship Photo", url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=85" },
  ];

  for (const asset of sampleMedia) {
    const [existing] = await db.select({ id: mediaAssets.id }).from(mediaAssets)
      .where(eq(mediaAssets.title, asset.title)).limit(1);
    if (!existing) {
      await db.insert(mediaAssets).values({
        title: asset.title,
        category: "image",
        status: "draft",
        visibility: "private",
        fileUrl: asset.url,
        mimeType: "image/jpeg",
      });
    } else {
      await db.update(mediaAssets)
        .set({ status: "draft", visibility: "private", updatedAt: new Date() })
        .where(eq(mediaAssets.title, asset.title));
    }
  }

  const [sampleRequest] = await db.select({ id: mediaRequests.id }).from(mediaRequests)
    .where(eq(mediaRequests.requesterName, "Sample Requester")).limit(1);
  if (!sampleRequest) {
    const [createdRequest] = await db.insert(mediaRequests).values({
      requesterName: "Sample Requester",
      requesterEmail: "sample@example.invalid",
      requestType: "flyer_design",
      programmeName: "Sample Campus Gathering",
      description: "Sample request for exercising the assignment and approval workflow.",
      deadline: dateAfter(10),
      status: "pending",
    }).returning({ id: mediaRequests.id });

    await db.insert(mediaTasks).values({
      requestId: createdRequest.id,
      title: "Sample flyer task",
      assigneeName: "Sample Media Volunteer",
      deadline: dateAfter(8),
      status: "pending",
    });
  }

  const sampleSettings = {
    fellowshipName: "Joint Christian Campus Fellowship",
    chapterName: "University of Offa",
    contactEmail: "",
    contactPhone: "",
    address: "",
    instagramUrl: "",
    facebookUrl: "",
  };

  for (const [key, value] of Object.entries(sampleSettings)) {
    await db.insert(siteSettings).values({ key, value })
      .onConflictDoNothing({ target: siteSettings.key });
  }

  await db.update(siteSettings)
    .set({ value: "", updatedAt: new Date() })
    .where(and(
      eq(siteSettings.key, "contactEmail"),
      eq(siteSettings.value, "sample@example.invalid"),
    ));
  await db.update(siteSettings)
    .set({ value: "", updatedAt: new Date() })
    .where(and(
      eq(siteSettings.key, "address"),
      eq(siteSettings.value, "Sample campus meeting location"),
    ));

  console.log("Sample records are ready in non-public states. Replace all SAMPLE values before public launch.");
}

seedSampleData()
  .catch((error) => {
    console.error("Sample seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { pool } = await import("./index.js");
    await pool.end();
  });