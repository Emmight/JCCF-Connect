import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { db } from "../db/index.js";
import { adminUsers, auditLogs } from "../db/schema.js";
import { authenticateToken } from "../middleware/auth.js";
import { loginRateLimit } from "../middleware/rateLimits.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

// POST /api/auth/login
router.post("/login", loginRateLimit, async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
      return;
    }

    const { email, password } = validation.data;

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);

    if (!user || user.status !== "active") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"],
        algorithm: "HS256",
      }
    );

    await db
      .update(adminUsers)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, user.id));

    void db.insert(auditLogs).values({
      actorId: user.id,
      action: "login",
      entityType: "auth",
      details: "Administrator signed in.",
    }).catch((error: unknown) => console.error("Unable to write login audit log:", error));

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
});

// GET /api/auth/me
// Get the currently authenticated administrator
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: adminUsers.id,
        fullName: adminUsers.fullName,
        email: adminUsers.email,
        role: adminUsers.role,
        status: adminUsers.status,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, req.user!.id))
      .limit(1);

    if (!user || user.status !== "active") {
      res.status(401).json({
        success: false,
        message: "Administrator account is unavailable.",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Authentication check error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify administrator.",
    });
  }
});

export default router;