// Vercel serverless function with basic functionality
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Database connection
let isConnected = false;

async function connectDatabase() {
  if (isConnected) return;

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    await connectDatabase();

    // Health endpoint
    if (req.url === "/health") {
      return res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        mongodb: "connected",
      });
    }

    // Registration endpoint - support both /auth/register and /api/auth/register
    if (
      (req.url === "/auth/register" || req.url === "/api/auth/register") &&
      req.method === "POST"
    ) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists. Please use a different email.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
      });

      await user.save();

      return res.status(201).json({
        message: "User created successfully",
        user: { email: user.email, id: user._id },
      });
    }

    // Login endpoint - support both /auth/login and /api/auth/login
    if (
      (req.url === "/auth/login" || req.url === "/api/auth/login") &&
      req.method === "POST"
    ) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check for hardcoded admin credentials
      if (email === "davidanyia72@gmail.com" && password === "72@gmail.com") {
        // Generate JWT token for admin
        const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
        const token = jwt.sign({ userId: "admin" }, JWT_SECRET, {
          expiresIn: "7d",
        });

        return res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: "admin",
            email: "davidanyia72@gmail.com",
            role: "admin",
            kycStatus: "approved",
            isVerified: true,
          },
        });
      }

      // Find regular user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified,
        },
      });
    }

    // Get all users endpoint (admin only)
    if (req.url === "/api/users" && req.method === "GET") {
      // Check authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Check if it's admin
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }

        // Get all users (excluding passwords)
        const users = await User.find({}, { password: 0 });

        return res.status(200).json({
          message: "Users retrieved successfully",
          users: users.map((user) => ({
            id: user._id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
        });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.json({
      message: "API is working",
      url: req.url,
      method: req.method,
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
