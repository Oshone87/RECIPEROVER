import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AssetBalance } from "../models/AssetBalance";
import { generateToken } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Registration attempt for email:", email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists with email:", email);
      return res.status(400).json({
        message: "Email already exists. Please use a different email.",
        email: email,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role: email === "davidanyia72@gmail.com" ? "admin" : "user",
    });

    await user.save();
    console.log("✅ User created successfully:", email);

    // Create initial asset balance
    const assetBalance = new AssetBalance({
      userId: user._id,
      bitcoin: 0,
      ethereum: 0,
      solana: 0,
      totalBalance: 0,
    });
    await assetBalance.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists. Please use a different email.",
        error: "Duplicate email",
      });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for hardcoded admin credentials first
    const adminEmail = "davidanyia72@gmail.com";
    const adminPassword = "72@gmail.com";

    if (email === adminEmail && password === adminPassword) {
      // Check if admin user exists in database, if not create it
      let adminUser = await User.findOne({ email: adminEmail });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        adminUser = new User({
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          isVerified: true,
          kycStatus: "approved",
        });
        await adminUser.save();
        console.log("✅ Admin user created successfully");

        // Create initial asset balance for admin
        const assetBalance = new AssetBalance({
          userId: adminUser._id,
          bitcoin: 0,
          ethereum: 0,
          solana: 0,
          totalBalance: 0,
        });
        await assetBalance.save();
      }

      // Generate token for admin
      const token = generateToken(adminUser._id.toString());

      return res.json({
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      isVerified: req.user.isVerified,
      role: req.user.role,
    },
  });
});

export default router;
