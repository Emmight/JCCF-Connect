import { Router } from "express";
import { count, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { adminUsers, administrations, announcements, auditLogs, birthdayRecords, mediaAssets, mediaRequests, programmes } from "../db/schema.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (_req, res) => {
    try {
      const [administrationCount, programmeCount, announcementCount, mediaCount, birthdayCount, requestCount, currentAdministration, recentActivity] = await Promise.all([
        db.select({ value: count() }).from(administrations),
        db.select({ value: count() }).from(programmes).where(eq(programmes.status, "published")),
        db.select({ value: count() }).from(announcements).where(eq(announcements.status, "published")),
        db.select({ value: count() }).from(mediaAssets),
        db.select({ value: count() }).from(birthdayRecords).where(eq(birthdayRecords.isOptedOut, false)),
        db.select({ value: count() }).from(mediaRequests).where(eq(mediaRequests.status, "pending")),
        db.select().from(administrations).where(eq(administrations.status, "current")).limit(1),
        db.select({
          id: auditLogs.id,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          details: auditLogs.details,
          createdAt: auditLogs.createdAt,
          actorName: adminUsers.fullName,
        }).from(auditLogs)
          .leftJoin(adminUsers, eq(auditLogs.actorId, adminUsers.id))
          .orderBy(desc(auditLogs.createdAt))
          .limit(8),
      ]);

      res.json({
        success: true,
        data: {
          counts: {
            administrations: administrationCount[0]?.value ?? 0,
            publishedProgrammes: programmeCount[0]?.value ?? 0,
            publishedAnnouncements: announcementCount[0]?.value ?? 0,
            mediaAssets: mediaCount[0]?.value ?? 0,
            birthdayRecords: birthdayCount[0]?.value ?? 0,
            pendingMediaRequests: requestCount[0]?.value ?? 0,
          },
          currentAdministration: currentAdministration[0] ?? null,
          recentActivity,
        },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      res.status(500).json({ success: false, message: "Unable to fetch dashboard data." });
    }
  }
);

export default router;