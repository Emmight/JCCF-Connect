import type { NextFunction, Request, Response } from "express";
import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";

export function auditAdminChanges(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    next();
    return;
  }

  res.once("finish", () => {
    if (!req.user || res.statusCode < 200 || res.statusCode >= 400) return;
    const path = req.originalUrl.split("?")[0];
    const entityType = path.split("/")[2] || "unknown";
    const idMatch = path.match(/\/(\d+)(?:\/|$)/);
    const body = req.body as { status?: unknown; visibility?: unknown } | undefined;
    const isPublishing = body?.status === "published" || body?.visibility === "published";
    const isArchiving = body?.status === "archived" || body?.visibility === "archived";
    const action = method === "POST"
      ? "create"
      : isPublishing
        ? "publish"
        : isArchiving || method === "DELETE"
          ? "archive"
          : "update";

    void db.insert(auditLogs).values({
      actorId: req.user.id,
      action,
      entityType,
      entityId: idMatch ? Number(idMatch[1]) : null,
      details: `${method} ${path}`.slice(0, 1000),
    }).catch((error: unknown) => {
      console.error("Unable to write audit log:", error);
    });
  });

  next();
}