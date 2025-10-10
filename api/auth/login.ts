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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check for hardcoded admin credentials first
    const adminEmail = "davidanyia72@gmail.com";
    const adminPassword = "72@gmail.com";

    if (email === adminEmail && password === adminPassword) {
      // Check if admin user exists in database, if not create it
      let adminUser = await User.findOne({ email: adminEmail });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        adminUser = new User({
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          isVerified: true,
          kycStatus: "approved",
        });
        await adminUser.save();
        console.log("✅ Admin user created successfully");
      }

      // Generate JWT token for admin
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      const token = jwt.sign({ userId: adminUser._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          kycStatus: adminUser.kycStatus,
          isVerified: adminUser.isVerified,
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
  } catch (error: any) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
