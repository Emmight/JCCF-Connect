import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { sql } from "drizzle-orm";

import { db } from "./db/index.js";
import administrationRoutes from "./routes/administrations.js";
import announcementRoutes from "./routes/announcements.js";
import birthdayRoutes from "./routes/birthdays.js";
import executiveRoutes from "./routes/executives.js";
import authRoutes from "./routes/auth.js";
import programmeRoutes from "./routes/programmes.js";
import mediaRequestRoutes from "./routes/mediaRequests.js";
import mediaRoutes from "./routes/media.js";
import dashboardRoutes from "./routes/dashboard.js";
import settingsRoutes from "./routes/settings.js";
import { auditAdminChanges } from "./middleware/audit.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") ?? "http://localhost:5173",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(auditAdminChanges);

const PORT = Number(process.env.PORT) || 5000;

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "JCCF Connect API is running 🚀",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/administrations", administrationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/birthdays", birthdayRoutes);
app.use("/api/executives", executiveRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/media-requests", mediaRequestRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found." });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

async function connectWithRetry(attempts = 5) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await db.execute(sql`select 1`);
      console.log("Database connected");
      return;
    } catch (err: any) {
      console.error(
        `DB connect attempt ${i}/${attempts} failed:`,
        err.cause?.code ?? err.message
      );
      if (i === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * i));
    }
  }
}

await connectWithRetry();

app.listen(PORT, () => {
  console.log(`JCCF Connect API running at http://localhost:${PORT}`);
});