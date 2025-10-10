import mongoose from "mongoose";
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

// Admin authentication middleware
async function requireAdmin(req: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new Error("No token provided");
  }

  const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
  const { userId } = jwt.verify(token, JWT_SECRET) as any;

  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDatabase();

    // Verify admin access
    await requireAdmin(req);

    if (req.method === "GET") {
      // Get all users
      const users = await User.find({})
        .select("-password") // Don't send passwords
        .sort({ createdAt: -1 });

      console.log(`👥 Admin viewing ${users.length} users`);

      return res.status(200).json({ users });
    }

    if (req.method === "DELETE") {
      // Delete user
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow admin to delete themselves
      const adminUser = await requireAdmin(req);
      if (userId === adminUser._id.toString()) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      await User.findByIdAndDelete(userId);

      console.log(`🗑️ Admin deleted user: ${user.email}`);

      return res.status(200).json({
        message: `User ${user.email} deleted successfully`,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: any) {
    console.error("Admin users error:", error);

    if (
      error.message === "No token provided" ||
      error.message === "Admin access required"
    ) {
      return res.status(403).json({ message: error.message });
    }

    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
