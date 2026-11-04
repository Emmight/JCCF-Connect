import { Router } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { mediaRequests, mediaTasks } from "../db/schema.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { mediaRequestRateLimit } from "../middleware/rateLimits.js";

const router = Router();

const requestStatuses = [
  "pending",
  "in_review",
  "assigned",
  "approved",
  "rejected",
  "completed",
] as const;

const taskStatuses = [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
  "archived",
] as const;

const requestSchema = z.object({
  requesterName: z.string().trim().min(2).max(150),
  requesterEmail: z.string().trim().email().max(255).nullable().optional(),
  requestType: z.string().trim().min(2).max(120),
  programmeName: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().min(10).max(5000),
  deadline: z.string().date().nullable().optional(),
});

const taskSchema = z.object({
  title: z.string().trim().min(3).max(200),
  assigneeName: z.string().trim().max(150).nullable().optional(),
  deadline: z.string().date().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

router.post("/", mediaRequestRateLimit, async (req, res) => {
  try {
    const validation = requestSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid media request details.",
        errors: validation.error.flatten(),
      });
      return;
    }

    const [created] = await db
      .insert(mediaRequests)
      .values({
        ...validation.data,
        requesterEmail: validation.data.requesterEmail?.toLowerCase() ?? null,
        createdBy: req.user?.id,
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Media request submitted successfully.",
      data: created,
    });
  } catch (error) {
    console.error("Media request submission error:", error);
    res.status(500).json({ success: false, message: "Unable to submit media request." });
  }
});

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (_req, res) => {
    try {
      const [requests, tasks] = await Promise.all([
        db.select().from(mediaRequests).orderBy(desc(mediaRequests.createdAt)),
        db.select().from(mediaTasks).orderBy(asc(mediaTasks.createdAt)),
      ]);

      const tasksByRequest = new Map<number, typeof tasks>();
      for (const task of tasks) {
        if (task.requestId === null) continue;
        const requestTasks = tasksByRequest.get(task.requestId) ?? [];
        requestTasks.push(task);
        tasksByRequest.set(task.requestId, requestTasks);
      }

      res.json({
        success: true,
        count: requests.length,
        data: requests.map((request) => ({
          ...request,
          tasks: tasksByRequest.get(request.id) ?? [],
        })),
      });
    } catch (error) {
      console.error("Failed to fetch media requests:", error);
      res.status(500).json({ success: false, message: "Unable to fetch media requests." });
    }
  }
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid media request ID." });
        return;
      }

      const validation = z.object({ status: z.enum(requestStatuses) }).strict().safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid media request status.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const [updated] = await db
        .update(mediaRequests)
        .set({ status: validation.data.status, updatedAt: new Date() })
        .where(eq(mediaRequests.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ success: false, message: "Media request not found." });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Media request update error:", error);
      res.status(500).json({ success: false, message: "Unable to update media request." });
    }
  }
);

router.post(
  "/:id/tasks",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);
      if (!Number.isInteger(requestId) || requestId <= 0) {
        res.status(400).json({ success: false, message: "Invalid media request ID." });
        return;
      }

      const validation = taskSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid task details.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const [request] = await db
        .select({ id: mediaRequests.id })
        .from(mediaRequests)
        .where(eq(mediaRequests.id, requestId))
        .limit(1);

      if (!request) {
        res.status(404).json({ success: false, message: "Media request not found." });
        return;
      }

      const [task] = await db
        .insert(mediaTasks)
        .values({
          ...validation.data,
          requestId,
          status: "pending",
          updatedAt: new Date(),
        })
        .returning();

      await db
        .update(mediaRequests)
        .set({ status: "assigned", updatedAt: new Date() })
        .where(and(eq(mediaRequests.id, requestId), eq(mediaRequests.status, "pending")));

      res.status(201).json({ success: true, message: "Task assigned successfully.", data: task });
    } catch (error) {
      console.error("Media task assignment error:", error);
      res.status(500).json({ success: false, message: "Unable to assign task." });
    }
  }
);

router.patch(
  "/tasks/:taskId",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (req, res) => {
    try {
      const taskId = Number(req.params.taskId);
      if (!Number.isInteger(taskId) || taskId <= 0) {
        res.status(400).json({ success: false, message: "Invalid media task ID." });
        return;
      }

      const validation = z.object({ status: z.enum(taskStatuses) }).strict().safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid media task status.",
          errors: validation.error.flatten(),
        });
        return;
      }

      const [updated] = await db
        .update(mediaTasks)
        .set({ status: validation.data.status, updatedAt: new Date() })
        .where(eq(mediaTasks.id, taskId))
        .returning();

      if (!updated) {
        res.status(404).json({ success: false, message: "Media task not found." });
        return;
      }

      if (updated.requestId !== null) {
        const requestTasks = await db
          .select({ status: mediaTasks.status })
          .from(mediaTasks)
          .where(eq(mediaTasks.requestId, updated.requestId));
        const requestStatus = requestTasks.length > 0 && requestTasks.every((task) => task.status === "approved")
          ? "completed"
          : requestTasks.some((task) => task.status === "rejected")
            ? "in_review"
            : "assigned";

        await db
          .update(mediaRequests)
          .set({ status: requestStatus, updatedAt: new Date() })
          .where(eq(mediaRequests.id, updated.requestId));
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Media task update error:", error);
      res.status(500).json({ success: false, message: "Unable to update media task." });
    }
  }
);

export default router;