import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { adminUsers } from "../db/schema.js";

export interface AuthUser {
  id: number;
  email: string;
  role: "super_admin" | "admin" | "media_team";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

const JWT_SECRET: string = secret;

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  try {
    const token = authorization.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "number"
    ) {
      res.status(401).json({  
        success: false,
        message: "Invalid authentication token.",
      });
      return;
    }

    // Always retrieve the latest account status and role from the database.
    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        role: adminUsers.role,
        status: adminUsers.status,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, decoded.id))
      .limit(1);

    if (!user || user.status !== "active") {
      res.status(401).json({
        success: false,
        message: "Your administrator account is inactive or unavailable.",
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
      return;
    }

    console.error("Authentication middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify authentication.",
    });
  }
}

export function authorizeRoles(...allowedRoles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
      return;
    }

    next();
  };
}