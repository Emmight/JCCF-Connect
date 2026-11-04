import { Router } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { administrations } from "../db/schema.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

const administrationSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
  status: z.enum(["upcoming", "current", "past"]).default("upcoming"),
  isFeatured: z.boolean().default(false),
}).strict();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(value: string, excludeId?: number) {
  const base = slugify(value);
  if (!base) throw new Error("Unable to generate a valid administration slug.");
  let candidate = base;
  let suffix = 1;

  while (true) {
    const [existing] = await db.select({ id: administrations.id })
      .from(administrations).where(eq(administrations.slug, candidate)).limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (_req, res) => {
    try {
      const results = await db.select().from(administrations).orderBy(asc(administrations.startDate));
      res.json({ success: true, count: results.length, data: results });
    } catch (error) {
      console.error("Failed to fetch admin administrations:", error);
      res.status(500).json({ success: false, message: "Unable to fetch administrations." });
    }
  }
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    const validation = administrationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, message: "Invalid administration details.", errors: validation.error.flatten() });
      return;
    }

    const data = validation.data;
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      res.status(400).json({ success: false, message: "End date cannot be earlier than start date." });
      return;
    }

    try {
      const slug = await uniqueSlug(data.slug || data.name);
      const [created] = await db.transaction(async (tx) => {
        if (data.status === "current") {
          await tx.update(administrations)
            .set({ status: "past", isFeatured: false, updatedAt: new Date() })
            .where(eq(administrations.status, "current"));
        }
        return tx.insert(administrations).values({ ...data, slug, updatedAt: new Date() }).returning();
      });
      res.status(201).json({ success: true, message: "Administration created successfully.", data: created });
    } catch (error) {
      console.error("Administration creation error:", error);
      res.status(500).json({ success: false, message: "Unable to create administration." });
    }
  }
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "Invalid administration ID." });
      return;
    }
    const validation = administrationSchema.partial().strict().safeParse(req.body);
    if (!validation.success || Object.keys(req.body).length === 0) {
      res.status(400).json({ success: false, message: "Invalid or empty update.", errors: validation.success ? undefined : validation.error.flatten() });
      return;
    }

    try {
      const [existing] = await db.select().from(administrations).where(eq(administrations.id, id)).limit(1);
      if (!existing) {
        res.status(404).json({ success: false, message: "Administration not found." });
        return;
      }
      const data = validation.data;
      const startDate = data.startDate === undefined ? existing.startDate : data.startDate;
      const endDate = data.endDate === undefined ? existing.endDate : data.endDate;
      if (startDate && endDate && endDate < startDate) {
        res.status(400).json({ success: false, message: "End date cannot be earlier than start date." });
        return;
      }
      const slug = data.slug || (data.name ? await uniqueSlug(data.name, id) : existing.slug);
      const [updated] = await db.transaction(async (tx) => {
        if (data.status === "current") {
          await tx.update(administrations)
            .set({ status: "past", isFeatured: false, updatedAt: new Date() })
            .where(eq(administrations.status, "current"));
        }
        return tx.update(administrations)
          .set({ ...data, slug, updatedAt: new Date() })
          .where(eq(administrations.id, id))
          .returning();
      });
      res.json({ success: true, message: "Administration updated successfully.", data: updated });
    } catch (error) {
      console.error("Administration update error:", error);
      res.status(500).json({ success: false, message: "Unable to update administration." });
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "Invalid administration ID." });
      return;
    }
    try {
      const [archived] = await db.update(administrations)
        .set({ status: "past", isFeatured: false, updatedAt: new Date() })
        .where(eq(administrations.id, id))
        .returning({ id: administrations.id });
      if (!archived) {
        res.status(404).json({ success: false, message: "Administration not found." });
        return;
      }
      res.json({ success: true, message: "Administration archived successfully." });
    } catch (error) {
      console.error("Administration archive error:", error);
      res.status(500).json({ success: false, message: "Unable to archive administration." });
    }
  }
);

// GET /api/administrations
// Fetch all administrations
router.get("/", async (_req, res) => {
  try {
    const results = await db
      .select()
      .from(administrations)
      .orderBy(desc(administrations.createdAt));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Failed to fetch administrations:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch administrations.",
    });
  }
});

// GET /api/administrations/current
// Fetch the current administration
router.get("/current", async (_req, res) => {
  try {
    const [current] = await db
      .select()
      .from(administrations)
      .where(eq(administrations.status, "current"))
      .limit(1);

    if (!current) {
      res.status(404).json({
        success: false,
        message: "No current administration found.",
      });
      return;
    }

    res.json({
      success: true,
      data: current,
    });
  } catch (error) {
    console.error("Failed to fetch current administration:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch current administration.",
    });
  }
});

// GET /api/administrations/:slug
// Fetch one administration by slug
router.get("/:slug", async (req, res) => {
  try {
    const [administration] = await db
      .select()
      .from(administrations)
      .where(eq(administrations.slug, req.params.slug))
      .limit(1);

    if (!administration) {
      res.status(404).json({
        success: false,
        message: "Administration not found.",
      });
      return;
    }

    res.json({
      success: true,
      data: administration,
    });
  } catch (error) {
    console.error("Failed to fetch administration:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch administration.",
    });
  }
});

export default router;