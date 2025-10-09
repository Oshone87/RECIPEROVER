import { Router } from "express";
import { User } from "../models/User";
import { Investment } from "../models/Investment";
import { AssetBalance } from "../models/AssetBalance";
import { authenticate, AuthRequest, requireAdmin } from "../middleware/auth";

const router = Router();

// Get all users (admin only)
router.get(
  "/users",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const users = await User.find({})
        .select("-password") // Don't send passwords
        .sort({ createdAt: -1 });

      console.log(`👥 Admin viewing ${users.length} users`);

      res.json({ users });
    } catch (error) {
      console.error("❌ Get users error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all investments (admin only)
router.get(
  "/investments",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const investments = await Investment.find({})
        .populate("userId", "email")
        .sort({ createdAt: -1 });

      console.log(`📊 Admin viewing ${investments.length} investments`);

      res.json({ investments });
    } catch (error) {
      console.error("❌ Get admin investments error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update user KYC status (admin only)
router.put(
  "/users/:id/kyc",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { status } = req.body; // 'approved', 'rejected', 'pending'

      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid KYC status" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.kycStatus = status;
      user.isVerified = status === "approved";
      user.updatedAt = new Date();

      await user.save();

      console.log(`✅ Admin updated KYC status for ${user.email}: ${status}`);

      res.json({
        message: `KYC status updated to ${status}`,
        user: {
          id: user._id,
          email: user.email,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("❌ Update KYC error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/users/:id",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.params.id;

      // Don't allow admin to delete themselves
      if (userId === req.userId) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete user's investments and balances
      await Investment.deleteMany({ userId });
      await AssetBalance.deleteOne({ userId });
      await User.findByIdAndDelete(userId);

      console.log(`🗑️ Admin deleted user: ${user.email}`);

      res.json({ message: `User ${user.email} deleted successfully` });
    } catch (error) {
      console.error("❌ Delete user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get platform statistics (admin only)
router.get(
  "/stats",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const totalUsers = await User.countDocuments({});
      const totalInvestments = await Investment.countDocuments({});
      const activeInvestments = await Investment.countDocuments({
        status: "active",
      });

      // Calculate total investment amounts
      const investmentStats = await Investment.aggregate([
        {
          $group: {
            _id: null,
            totalInvested: { $sum: "$amount" },
            avgInvestment: { $avg: "$amount" },
          },
        },
      ]);

      const kycStats = await User.aggregate([
        {
          $group: {
            _id: "$kycStatus",
            count: { $sum: 1 },
          },
        },
      ]);

      console.log(`📈 Admin viewing platform statistics`);

      res.json({
        stats: {
          totalUsers,
          totalInvestments,
          activeInvestments,
          totalInvested: investmentStats[0]?.totalInvested || 0,
          avgInvestment: investmentStats[0]?.avgInvestment || 0,
          kycStats: kycStats.reduce((acc: any, curr: any) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      console.error("❌ Get stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
