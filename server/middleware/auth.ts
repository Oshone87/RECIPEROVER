import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("🔍 Auth Debug - Headers:", req.headers.authorization);
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    console.log("🔍 Token extracted:", token.substring(0, 20) + "...");

    const { userId } = verifyToken(token);
    console.log("🔍 Decoded userId:", userId);

    const user = await User.findById(userId);
    console.log("🔍 User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = userId;
    req.user = user;
    console.log("✅ Authentication successful");
    next();
  } catch (error: any) {
    console.log(
      "❌ JWT verification error:",
      error?.message || "Unknown error"
    );
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}
