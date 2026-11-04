import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { birthdayRecords } from "../db/schema.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = Router();

const birthdaySchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  visibility: z.enum(["public", "executive", "private"]).default("public"),
  isOptedOut: z.boolean().default(false),
  notes: z.string().trim().max(500).nullable().optional(),
});

router.get("/", async (_req, res) => {
  try {
    const results = await db
      .select()
      .from(birthdayRecords)
      .where(and(eq(birthdayRecords.isOptedOut, false), eq(birthdayRecords.visibility, "public")))
      .orderBy(asc(birthdayRecords.month), asc(birthdayRecords.day));

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Failed to fetch birthdays:", error);
    res.status(500).json({ success: false, message: "Unable to fetch birthday records." });
  }
});

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (_req, res) => {
    try {
      const results = await db
        .select()
        .from(birthdayRecords)
        .orderBy(asc(birthdayRecords.month), asc(birthdayRecords.day));

      res.json({ success: true, count: results.length, data: results });
    } catch (error) {
      console.error("Failed to fetch all birthday records:", error);
      res.status(500).json({ success: false, message: "Unable to fetch birthday records." });
    }
  }
);

router.get("/upcoming", async (_req, res) => {
  try {
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const records = await db
      .select()
      .from(birthdayRecords)
      .where(and(eq(birthdayRecords.isOptedOut, false), eq(birthdayRecords.visibility, "public")));

    const results = records
      .map((record) => {
        let nextBirthday = Date.UTC(now.getUTCFullYear(), record.month - 1, record.day);
        if (nextBirthday < today) {
          nextBirthday = Date.UTC(now.getUTCFullYear() + 1, record.month - 1, record.day);
        }
        return { record, daysUntil: Math.floor((nextBirthday - today) / 86_400_000) };
      })
      .sort((left, right) => left.daysUntil - right.daysUntil)
      .map(({ record }) => record);

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Failed to fetch upcoming birthdays:", error);
    res.status(500).json({ success: false, message: "Unable to fetch upcoming birthdays." });
  }
});

router.post(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    try {
      const validation = birthdaySchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid birthday details.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const [created] = await db
        .insert(birthdayRecords)
        .values({
          ...validation.data,
          createdBy: req.user?.id,
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json({ success: true, message: "Birthday record created successfully.", data: created });
    } catch (error) {
      console.error("Birthday creation error:", error);
      res.status(500).json({ success: false, message: "Unable to create birthday record." });
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
        res.status(400).json({ success: false, message: "Invalid birthday ID." });
        return;
      }

      const validation = birthdaySchema.partial().safeParse(req.body);
      if (!validation.success || Object.keys(req.body).length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid or empty update payload.",
          errors: validation.success ? undefined : validation.error.flatten(),
        });
        return;
      }

      const [updated] = await db
        .update(birthdayRecords)
        .set({
          ...validation.data,
          updatedAt: new Date(),
        })
        .where(eq(birthdayRecords.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ success: false, message: "Birthday record not found." });
        return;
      }

      res.json({ success: true, message: "Birthday record updated successfully.", data: updated });
    } catch (error) {
      console.error("Birthday update error:", error);
      res.status(500).json({ success: false, message: "Unable to update birthday record." });
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
        res.status(400).json({ success: false, message: "Invalid birthday ID." });
        return;
      }

      const [deleted] = await db
        .delete(birthdayRecords)
        .where(eq(birthdayRecords.id, id))
        .returning({ id: birthdayRecords.id });

      if (!deleted) {
        res.status(404).json({ success: false, message: "Birthday record not found." });
        return;
      }

      res.json({ success: true, message: "Birthday record deleted successfully." });
    } catch (error) {
      console.error("Birthday deletion error:", error);
      res.status(500).json({ success: false, message: "Unable to delete birthday record." });
    }
  }
);

export default router;
