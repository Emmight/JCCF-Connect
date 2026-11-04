
import { Router } from "express";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNotNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { programmes } from "../db/schema.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = Router();

const programmeCategories = [
  "worship",
  "prayer",
  "bible_study",
  "conference",
  "seminar",
  "outreach",
  "fellowship",
  "other",
] as const;

const programmeStatuses = [
  "draft",
  "published",
  "cancelled",
  "completed",
] as const;

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value;
  }, "Invalid calendar date.");

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format.");

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2000)
  .nullable()
  .optional();

const programmeFields = {
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220).optional(),
  description: z.string().max(10000).nullable().optional(),
  category: z.enum(programmeCategories).default("other"),
  startDate: dateSchema,
  endDate: dateSchema.nullable().optional(),
  startTime: timeSchema.nullable().optional(),
  endTime: timeSchema.nullable().optional(),
  venue: z.string().trim().max(255).nullable().optional(),
  imageUrl: optionalUrlSchema,
  registrationUrl: optionalUrlSchema,
  status: z.enum(programmeStatuses).default("draft"),
  isFeatured: z.boolean().default(false),
};

const createProgrammeSchema = z
  .object(programmeFields)
  .strict()
  .refine(
    (data) =>
      !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date cannot be earlier than start date.",
      path: ["endDate"],
    }
  );

const updateProgrammeSchema = z
  .object({
    title: programmeFields.title.optional(),
    slug: programmeFields.slug,
    description: programmeFields.description,
    category: z.enum(programmeCategories).optional(),
    startDate: programmeFields.startDate.optional(),
    endDate: programmeFields.endDate,
    startTime: programmeFields.startTime,
    endTime: programmeFields.endTime,
    venue: programmeFields.venue,
    imageUrl: programmeFields.imageUrl,
    registrationUrl: programmeFields.registrationUrl,
    status: z.enum(programmeStatuses).optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict();

// Generate a URL-friendly slug.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Ensure every programme has a unique slug.
async function generateUniqueSlug(
  value: string,
  excludeId?: number
): Promise<string> {
  const baseSlug = slugify(value);

  if (!baseSlug) {
    throw new Error("Unable to generate a valid programme slug.");
  }

  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: programmes.id })
      .from(programmes)
      .where(eq(programmes.slug, candidate))
      .limit(1);

    if (!existing.length || existing[0].id === excludeId) {
      return candidate;
    }

    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}

// GET /api/programmes
// Public: fetch published programmes.
// Optional filters: category and period (upcoming or past).
router.get("/", async (req, res) => {
  try {
    const category = req.query.category;
    const period = req.query.period;

    if (
      category !== undefined &&
      (typeof category !== "string" ||
        !programmeCategories.includes(
          category as (typeof programmeCategories)[number]
        ))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid programme category.",
      });
      return;
    }

    if (
      period !== undefined &&
      period !== "upcoming" &&
      period !== "past"
    ) {
      res.status(400).json({
        success: false,
        message: "Period must be upcoming or past.",
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const filters = [
      eq(programmes.status, "published"),
    ];

    if (typeof category === "string") {
      filters.push(
        eq(
          programmes.category,
          category as (typeof programmeCategories)[number]
        )
      );
    }

    if (period === "upcoming") {
      filters.push(
        or(
          gte(programmes.startDate, today),
          and(
            isNotNull(programmes.endDate),
            gte(programmes.endDate, today)
          )
        )!
      );
    }

    if (period === "past") {
      filters.push(
        sql`COALESCE(${programmes.endDate}, ${programmes.startDate}) < ${today}`
      );
    }

    const results = await db
      .select()
      .from(programmes)
      .where(and(...filters))
      .orderBy(asc(programmes.startDate));

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Failed to fetch programmes:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch programmes.",
    });
  }
});

// GET /api/programmes/admin/all
// Admin: fetch all programmes, including drafts and cancelled ones.
router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (_req, res) => {
    try {
      const results = await db
        .select()
        .from(programmes)
        .orderBy(desc(programmes.createdAt));

      res.json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error("Failed to fetch all programmes:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch programmes.",
      });
    }
  }
);

// POST /api/programmes
// Admin: create a programme.
router.post(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const validation = createProgrammeSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid programme information.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const data = validation.data;

      const slug = await generateUniqueSlug(
        data.slug || data.title
      );

      const [created] = await db
        .insert(programmes)
        .values({
          ...data,
          slug,
        })
        .returning();

      res.status(201).json({
        success: true,
        message: "Programme created successfully.",
        data: created,
      });
    } catch (error) {
      console.error("Programme creation error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create programme.",
      });
    }
  }
);

// PATCH /api/programmes/:id
// Admin: update programme details or status.
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid programme ID.",
        });
        return;
      }

      const validation = updateProgrammeSchema.safeParse(req.body);

      if (
        !validation.success ||
        Object.keys(req.body).length === 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid or empty update information.",
          errors: validation.success
            ? undefined
            : validation.error.flatten(),
        });
        return;
      }

      const data = validation.data;

      if (
  data.startDate &&
  data.endDate &&
  data.endDate < data.startDate
) {
  res.status(400).json({
    success: false,
    message: "End date cannot be earlier than start date.",
  });
  return;
}

      const [existing] = await db
        .select()
        .from(programmes)
        .where(eq(programmes.id, id))
        .limit(1);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Programme not found.",
        });
        return;
      }

      const nextStartDate = data.startDate ?? existing.startDate;
      const nextEndDate =
        data.endDate === undefined
          ? existing.endDate
          : data.endDate;

      if (nextEndDate && nextEndDate < nextStartDate) {
        res.status(400).json({
          success: false,
          message: "End date cannot be earlier than start date.",
        });
        return;
      }

      let slug = data.slug;

      if (data.slug || data.title) {
        slug = await generateUniqueSlug(
          data.slug || data.title!,
          id
        );
      }

      const [updated] = await db
        .update(programmes)
        .set({
          ...data,
          ...(slug ? { slug } : {}),
          updatedAt: new Date(),
        })
        .where(eq(programmes.id, id))
        .returning();

      res.json({
        success: true,
        message: "Programme updated successfully.",
        data: updated,
      });
    } catch (error) {
      console.error("Programme update error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update programme.",
      });
    }
  }
);

// DELETE /api/programmes/:id
// Super Admin only: permanently delete a programme.
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid programme ID.",
        });
        return;
      }

      const [deleted] = await db
        .delete(programmes)
        .where(eq(programmes.id, id))
        .returning({ id: programmes.id });

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Programme not found.",
        });
        return;
      }

      res.json({
        success: true,
        message: "Programme deleted successfully.",
      });
    } catch (error) {
      console.error("Programme deletion error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to delete programme.",
      });
    }
  }
);

// GET /api/programmes/:slug
// Public: fetch one published programme by slug.
router.get("/:slug", async (req, res) => {
  try {
    const [programme] = await db
      .select()
      .from(programmes)
      .where(
        and(
          eq(programmes.slug, req.params.slug),
          eq(programmes.status, "published")
        )
      )
      .limit(1);

    if (!programme) {
      res.status(404).json({
        success: false,
        message: "Programme not found.",
      });
      return;
    }

    res.json({
      success: true,
      data: programme,
    });
  } catch (error) {
    console.error("Failed to fetch programme:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch programme.",
    });
  }
});

export default router;
