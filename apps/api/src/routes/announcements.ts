import { Router } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { announcements } from "../db/schema.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = Router();

const announcementStatusValues = ["draft", "published", "archived"] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const announcementSchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(1000).nullable().optional(),
  content: z.string().trim().min(10).max(20000),
  category: z.string().trim().min(2).max(80).default("announcement"),
  status: z.enum(announcementStatusValues).default("draft"),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().datetime({ offset: false }).nullable().optional(),
});

async function generateUniqueSlug(value: string, excludeId?: number) {
  const base = slugify(value);
  if (!base) throw new Error("Unable to generate announcement slug.");

  let candidate = base;
  let counter = 1;

  while (true) {
    const [existing] = await db
      .select({ id: announcements.id })
      .from(announcements)
      .where(eq(announcements.slug, candidate))
      .limit(1);

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

router.get("/", async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const filters = [eq(announcements.status, "published")];

    if (category) {
      filters.push(eq(announcements.category, category));
    }

    if (status && announcementStatusValues.includes(status as (typeof announcementStatusValues)[number])) {
      filters.push(eq(announcements.status, status as (typeof announcementStatusValues)[number]));
    }

    const data = await db
      .select()
      .from(announcements)
      .where(and(...filters))
      .orderBy(desc(announcements.isFeatured), desc(announcements.publishedAt ?? announcements.createdAt));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    res.status(500).json({ success: false, message: "Unable to fetch announcements." });
  }
});

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (_req, res) => {
    try {
      const data = await db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.updatedAt));

      res.json({ success: true, count: data.length, data });
    } catch (error) {
      console.error("Failed to fetch all announcements:", error);
      res.status(500).json({ success: false, message: "Unable to fetch announcements." });
    }
  }
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const validation = announcementSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid announcement details.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const payload = validation.data;
      const slug = await generateUniqueSlug(payload.title);

      const [created] = await db
        .insert(announcements)
        .values({
          ...payload,
          slug,
          publishedAt:
            payload.status === "published"
              ? payload.publishedAt ? new Date(payload.publishedAt) : new Date()
              : null,
          createdBy: req.user?.id,
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json({ success: true, message: "Announcement created successfully.", data: created });
    } catch (error) {
      console.error("Announcement creation error:", error);
      res.status(500).json({ success: false, message: "Unable to create announcement." });
    }
  }
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid announcement ID." });
        return;
      }

      const validation = announcementSchema.partial().safeParse(req.body);
      if (!validation.success || Object.keys(req.body).length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid or empty update payload.",
          errors: validation.success ? undefined : validation.error.flatten(),
        });
        return;
      }

      const payload = validation.data;
      const [existing] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
      if (!existing) {
        res.status(404).json({ success: false, message: "Announcement not found." });
        return;
      }

      let nextSlug = existing.slug;
      if (payload.title) {
        nextSlug = await generateUniqueSlug(payload.title, id);
      }

      let nextPublishedAt = existing.publishedAt;
      if (payload.status === "published") {
        nextPublishedAt = payload.publishedAt ? new Date(payload.publishedAt) : (existing.publishedAt ?? new Date());
      } else if (payload.status && existing.status === "published") {
        nextPublishedAt = null;
      }

      const [updated] = await db
        .update(announcements)
        .set({
          ...payload,
          slug: nextSlug,
          publishedAt: nextPublishedAt,
          updatedAt: new Date(),
        })
        .where(eq(announcements.id, id))
        .returning();

      res.json({ success: true, message: "Announcement updated successfully.", data: updated });
    } catch (error) {
      console.error("Announcement update error:", error);
      res.status(500).json({ success: false, message: "Unable to update announcement." });
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid announcement ID." });
        return;
      }

      const [updated] = await db
        .update(announcements)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(announcements.id, id))
        .returning({ id: announcements.id });

      if (!updated) {
        res.status(404).json({ success: false, message: "Announcement not found." });
        return;
      }

      res.json({ success: true, message: "Announcement archived successfully." });
    } catch (error) {
      console.error("Announcement archive error:", error);
      res.status(500).json({ success: false, message: "Unable to archive announcement." });
    }
  }
);

export default router;
