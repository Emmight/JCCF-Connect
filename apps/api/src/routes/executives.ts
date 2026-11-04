import { Router } from "express";
import { asc, eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { administrations, executives } from "../db/schema.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = Router();

// GET /api/executives/admin/all
// Fetch all executives, including inactive ones (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (_req, res) => {
    try {
      const results = await db
        .select({
          id: executives.id,
          administrationId: executives.administrationId,
          fullName: executives.fullName,
          position: executives.position,
          email: executives.email,
          photoUrl: executives.photoUrl,
          biography: executives.biography,
          displayOrder: executives.displayOrder,
          status: executives.status,
          administrationName: administrations.name,
          administrationSlug: administrations.slug,
        })
        .from(executives)
        .innerJoin(
          administrations,
          eq(executives.administrationId, administrations.id)
        )
        .orderBy(
          asc(executives.administrationId),
          asc(executives.displayOrder)
        );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Failed to fetch all executives:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch executives.",
      });
    }
  }
);

const createExecutiveSchema = z.object({
  administrationId: z.number().int().positive(),
  fullName: z.string().trim().min(2).max(150),
  position: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).nullable().optional(),
  photoUrl: z.string().max(2000).nullable().optional(),
  biography: z.string().max(5000).nullable().optional(),
  displayOrder: z.number().int().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateExecutiveSchema = createExecutiveSchema
  .partial()
  .extend({
    status: z.enum(["active", "inactive"]).optional(),
  })
  .strict();

// GET /api/executives
// Fetch all executives across all administrations
router.get("/", async (_req, res) => {
  try {
    const results = await db
      .select({
        id: executives.id,
        administrationId: executives.administrationId,
        fullName: executives.fullName,
        position: executives.position,
        photoUrl: executives.photoUrl,
        biography: executives.biography,
        displayOrder: executives.displayOrder,
        status: executives.status,
        administrationName: administrations.name,
        administrationSlug: administrations.slug,
      })
      .from(executives)
      .innerJoin(
        administrations,
        eq(executives.administrationId, administrations.id)
      )
      .where(eq(executives.status, "active"))
      .orderBy(asc(executives.displayOrder));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Failed to fetch executives:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch executives.",
    });
  }
});

// GET /api/executives/administration/:slug
// Fetch executives belonging to a particular administration
router.get("/administration/:slug", async (req, res) => {
  try {
    const results = await db
      .select({
        id: executives.id,
        administrationId: executives.administrationId,
        fullName: executives.fullName,
        position: executives.position,
        photoUrl: executives.photoUrl,
        biography: executives.biography,
        displayOrder: executives.displayOrder,
        status: executives.status,
      })
      .from(executives)
      .innerJoin(
        administrations,
        eq(executives.administrationId, administrations.id)
      )
      .where(
  and(
    eq(administrations.slug, req.params.slug),
    eq(executives.status, "active")
  )
)
      .orderBy(asc(executives.displayOrder));

    res.json({
      success: true,
      administration: req.params.slug,
      data: results,
    });
  } catch (error) {
    console.error("Failed to fetch administration executives:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch executives.",
    });
  }
});

// POST /api/executives
// Create an executive
router.post(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const validation = createExecutiveSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid executive information.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const data = validation.data;

      const [administration] = await db
        .select({ id: administrations.id })
        .from(administrations)
        .where(eq(administrations.id, data.administrationId))
        .limit(1);

      if (!administration) {
        res.status(404).json({
          success: false,
          message: "Administration not found.",
        });
        return;
      }

      const [created] = await db
        .insert(executives)
        .values({
          ...data,
          email: data.email?.toLowerCase() ?? null,
        })
        .returning();

      res.status(201).json({
        success: true,
        message: "Executive created successfully.",
        data: created,
      });
    } catch (error) {
      console.error("Executive creation error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create executive.",
      });
    }
  }
);

// PATCH /api/executives/:id
// Update an executive
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
          message: "Invalid executive ID.",
        });
        return;
      }

      const validation = updateExecutiveSchema.safeParse(req.body);

      if (!validation.success || Object.keys(req.body).length === 0) {
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

      const [existing] = await db
        .select({ id: executives.id })
        .from(executives)
        .where(eq(executives.id, id))
        .limit(1);

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Executive not found.",
        });
        return;
      }

      if (data.administrationId !== undefined) {
        const [administration] = await db
          .select({ id: administrations.id })
          .from(administrations)
          .where(eq(administrations.id, data.administrationId))
          .limit(1);

        if (!administration) {
          res.status(404).json({
            success: false,
            message: "Administration not found.",
          });
          return;
        }
      }

      const [updated] = await db
        .update(executives)
        .set({
          ...data,
          email:
            data.email === undefined
              ? undefined
              : data.email?.toLowerCase() ?? null,
          updatedAt: new Date(),
        })
        .where(eq(executives.id, id))
        .returning();

      res.json({
        success: true,
        message: "Executive updated successfully.",
        data: updated,
      });
    } catch (error) {
      console.error("Executive update error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update executive.",
      });
    }
  }
);

// DELETE /api/executives/:id
// Deactivate an executive instead of permanently deleting their record
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
          message: "Invalid executive ID.",
        });
        return;
      }

      const [updated] = await db
        .update(executives)
        .set({
          status: "inactive",
          updatedAt: new Date(),
        })
        .where(eq(executives.id, id))
        .returning({ id: executives.id });

      if (!updated) {
        res.status(404).json({
          success: false,
          message: "Executive not found.",
        });
        return;
      }

      res.json({
        success: true,
        message: "Executive deactivated successfully.",
      });
    } catch (error) {
      console.error("Executive deactivation error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to deactivate executive.",
      });
    }
  }
);

// GET /api/executives/:id
// Fetch one executive
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid executive ID.",
      });
      return;
    }

    const [executive] = await db
      .select({
        id: executives.id,
        administrationId: executives.administrationId,
        fullName: executives.fullName,
        position: executives.position,
        photoUrl: executives.photoUrl,
        biography: executives.biography,
        displayOrder: executives.displayOrder,
        status: executives.status,
        administrationName: administrations.name,
        administrationSlug: administrations.slug,
      })
      .from(executives)
      .innerJoin(
        administrations,
        eq(executives.administrationId, administrations.id)
      )
      .where(
  and(
    eq(executives.id, id),
    eq(executives.status, "active")
  )
)
      .limit(1);

    if (!executive) {
      res.status(404).json({
        success: false,
        message: "Executive not found.",
      });
      return;
    }

    res.json({
      success: true,
      data: executive,
    });
  } catch (error) {
    console.error("Failed to fetch executive:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch executive.",
    });
  }
});

export default router;