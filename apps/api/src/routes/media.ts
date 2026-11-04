import { createReadStream } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { Router } from "express";
import multer from "multer";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import { mediaAssets } from "../db/schema.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { inspectImage, isSafeMediaStorageKey } from "../media/validation.js";

const router = Router();
const storageRoot = path.resolve(process.env.MEDIA_STORAGE_PATH ?? "./uploads");
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, and WebP images are allowed."));
      return;
    }
    callback(null, true);
  },
});

function receiveImage(req: Parameters<Parameters<typeof router.post>[1]>[0], res: Parameters<Parameters<typeof router.post>[1]>[1], next: Parameters<Parameters<typeof router.post>[1]>[2]) {
  upload.single("file")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    const isTooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
    res.status(isTooLarge ? 413 : 400).json({
      success: false,
      message: isTooLarge ? "Image must be 8 MB or smaller." : error instanceof Error ? error.message : "Unable to read image upload.",
    });
  });
}

const updateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  category: z.enum(["flyer", "image", "video", "document", "audio", "logo", "other"]).optional(),
  status: z.enum(["draft", "approved", "archived"]).optional(),
  visibility: z.enum(["private", "pending", "published", "archived"]).optional(),
}).strict();

router.get("/public", async (_req, res) => {
  try {
    const assets = await db.select({
      id: mediaAssets.id,
      title: mediaAssets.title,
      category: mediaAssets.category,
      mimeType: mediaAssets.mimeType,
      fileUrl: mediaAssets.fileUrl,
      createdAt: mediaAssets.createdAt,
    }).from(mediaAssets).where(and(
      eq(mediaAssets.status, "approved"),
      eq(mediaAssets.visibility, "published"),
    )).orderBy(desc(mediaAssets.createdAt));
    res.json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    console.error("Failed to fetch public media:", error);
    res.status(500).json({ success: false, message: "Unable to fetch media." });
  }
});

router.get(
  "/admin/all",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (_req, res) => {
    try {
      const assets = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
      res.json({ success: true, count: assets.length, data: assets });
    } catch (error) {
      console.error("Failed to fetch media assets:", error);
      res.status(500).json({ success: false, message: "Unable to fetch media assets." });
    }
  }
);

router.post(
  "/upload",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  receiveImage,
  async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "Select an image to upload." });
      return;
    }

    const detectedType = await inspectImage(file.buffer);
    if (!detectedType) {
      res.status(400).json({ success: false, message: "Image content must be a valid JPEG, PNG, or WebP file." });
      return;
    }

    const metadata = z.object({
      title: z.string().trim().min(2).max(200),
      category: z.enum(["flyer", "image", "logo", "other"]).default("image"),
    }).safeParse(req.body);
    if (!metadata.success) {
      res.status(400).json({ success: false, message: "Invalid media details.", errors: metadata.error.flatten() });
      return;
    }

    const storageKey = `${randomUUID()}.${detectedType.extension}`;
    const filePath = path.join(storageRoot, storageKey);
    try {
      await mkdir(storageRoot, { recursive: true });
      await writeFile(filePath, file.buffer, { flag: "wx", mode: 0o600 });
      const [asset] = await db.insert(mediaAssets).values({
        title: metadata.data.title,
        category: metadata.data.category,
        status: "draft",
        visibility: "private",
        fileUrl: `/api/media/${storageKey}`,
        storageKey,
        mimeType: detectedType.mime,
        fileSize: file.size,
        uploadedBy: req.user?.id,
        updatedAt: new Date(),
      }).returning();
      res.status(201).json({ success: true, message: "Image uploaded as a private draft.", data: asset });
    } catch (error) {
      await unlink(filePath).catch(() => undefined);
      console.error("Media upload error:", error);
      res.status(500).json({ success: false, message: "Unable to save media upload." });
    }
  }
);

router.get(
  "/admin/file/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "Invalid media asset ID." });
      return;
    }
    const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
    if (!asset?.storageKey) {
      res.status(404).json({ success: false, message: "Media asset not found." });
      return;
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", asset.mimeType ?? "application/octet-stream");
    createReadStream(path.join(storageRoot, asset.storageKey))
      .on("error", () => res.status(404).end())
      .pipe(res);
  }
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("super_admin", "admin", "media_team"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, message: "Invalid media asset ID." });
      return;
    }
    const validation = updateSchema.safeParse(req.body);
    if (!validation.success || Object.keys(req.body).length === 0) {
      res.status(400).json({ success: false, message: "Invalid or empty media update.", errors: validation.success ? undefined : validation.error.flatten() });
      return;
    }
    if (req.user?.role === "media_team" && (validation.data.status === "approved" || validation.data.visibility === "published")) {
      res.status(403).json({ success: false, message: "Only an administrator can publish media." });
      return;
    }
    const [updated] = await db.update(mediaAssets)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(mediaAssets.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ success: false, message: "Media asset not found." });
      return;
    }
    res.json({ success: true, data: updated });
  }
);

router.get("/:storageKey", async (req, res) => {
  const { storageKey } = req.params;
  if (!isSafeMediaStorageKey(storageKey)) {
    res.status(404).end();
    return;
  }
  const [asset] = await db.select({ storageKey: mediaAssets.storageKey, mimeType: mediaAssets.mimeType })
    .from(mediaAssets).where(and(
      eq(mediaAssets.storageKey, storageKey),
      eq(mediaAssets.status, "approved"),
      eq(mediaAssets.visibility, "published"),
    )).limit(1);
  if (!asset?.storageKey) {
    res.status(404).end();
    return;
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Content-Type", asset.mimeType ?? "application/octet-stream");
  createReadStream(path.join(storageRoot, asset.storageKey))
    .on("error", () => res.status(404).end())
    .pipe(res);
});

export default router;