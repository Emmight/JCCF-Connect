import { Router } from "express";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { siteSettings } from "../db/schema.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();
const settingsSchema = z.object({
  fellowshipName: z.string().trim().min(2).max(150).optional(),
  chapterName: z.string().trim().min(2).max(150).optional(),
  contactEmail: z.union([z.string().trim().email().max(255), z.literal("")]).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  instagramUrl: z.union([z.string().trim().url().max(500), z.literal("")]).optional(),
  facebookUrl: z.union([z.string().trim().url().max(500), z.literal("")]).optional(),
}).strict();

const publicKeys = ["fellowshipName", "chapterName", "contactEmail", "contactPhone", "address", "instagramUrl", "facebookUrl"] as const;

router.get("/public", async (_req, res) => {
  try {
    const rows = await db.select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(inArray(siteSettings.key, [...publicKeys]));
    res.json({ success: true, data: Object.fromEntries(rows.map(({ key, value }) => [key, value])) });
  } catch (error) {
    console.error("Failed to fetch public site settings:", error);
    res.status(500).json({ success: false, message: "Unable to fetch public settings." });
  }
});

router.get(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (_req, res) => {
    try {
      const rows = await db.select().from(siteSettings).orderBy(asc(siteSettings.key));
      const data = Object.fromEntries(rows.map(({ key, value }) => [key, value]));
      res.json({ success: true, data });
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      res.status(500).json({ success: false, message: "Unable to fetch site settings." });
    }
  }
);

router.patch(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin"),
  async (req, res) => {
    const validation = settingsSchema.safeParse(req.body);
    if (!validation.success || Object.keys(req.body).length === 0) {
      res.status(400).json({ success: false, message: "Invalid or empty settings update.", errors: validation.success ? undefined : validation.error.flatten() });
      return;
    }
    try {
      const updatedAt = new Date();
      await db.transaction(async (tx) => {
        for (const [key, value] of Object.entries(validation.data)) {
          if (value === undefined) continue;
          await tx.insert(siteSettings).values({
            key,
            value,
            updatedBy: req.user?.id,
            updatedAt,
          }).onConflictDoUpdate({
            target: siteSettings.key,
            set: { value, updatedBy: req.user?.id, updatedAt },
          });
        }
      });
      const rows = await db.select().from(siteSettings).orderBy(asc(siteSettings.key));
      res.json({ success: true, message: "Settings saved successfully.", data: Object.fromEntries(rows.map(({ key, value }) => [key, value])) });
    } catch (error) {
      console.error("Site settings update error:", error);
      res.status(500).json({ success: false, message: "Unable to save site settings." });
    }
  }
);

export default router;