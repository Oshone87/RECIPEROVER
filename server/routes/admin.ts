import { Router } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Investment } from "../models/Investment";
import { AssetBalance } from "../models/AssetBalance";
import { KYCRequest } from "../models/KYCRequest";
import { DepositRequest } from "../models/DepositRequest";
import { WithdrawalRequest } from "../models/WithdrawalRequest";
import { Transaction } from "../models/Transaction";
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

      // Get request counts
      const pendingKyc = await KYCRequest.countDocuments({ status: "pending" });
      const pendingDeposits = await DepositRequest.countDocuments({
        status: "pending",
      });
      const pendingWithdrawals = await WithdrawalRequest.countDocuments({
        status: "pending",
      });

      console.log(`📈 Admin viewing platform statistics`);

      res.json({
        stats: {
          totalUsers,
          totalInvestments,
          activeInvestments,
          totalInvested: investmentStats[0]?.totalInvested || 0,
          avgInvestment: investmentStats[0]?.avgInvestment || 0,
          pendingKyc,
          pendingDeposits,
          pendingWithdrawals,
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

// Get all KYC requests (admin only)
router.get(
  "/kyc-requests",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const kycRequests = await KYCRequest.find({})
        .populate("userId", "email")
        .sort({ createdAt: -1 });

      console.log(`📋 Admin viewing ${kycRequests.length} KYC requests`);

      res.json({ requests: kycRequests });
    } catch (error) {
      console.error("❌ Get KYC requests error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update KYC request status (admin only)
router.put(
  "/kyc-requests/:id",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { status, rejectionReason } = req.body;

      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const kycRequest = await KYCRequest.findById(req.params.id).populate(
        "userId",
        "email"
      );
      if (!kycRequest) {
        return res.status(404).json({ message: "KYC request not found" });
      }

      kycRequest.status = status;
      kycRequest.reviewDate = new Date();
      kycRequest.reviewedBy = req.userId
        ? new mongoose.Types.ObjectId(req.userId)
        : null;
      if (rejectionReason) kycRequest.rejectionReason = rejectionReason;
      kycRequest.updatedAt = new Date();

      await kycRequest.save();

      // Update user's KYC status
      if (status === "approved") {
        await User.findByIdAndUpdate(kycRequest.userId._id, {
          kycStatus: "approved",
          isVerified: true,
          updatedAt: new Date(),
        });
      } else if (status === "rejected") {
        await User.findByIdAndUpdate(kycRequest.userId._id, {
          kycStatus: "rejected",
          isVerified: false,
          updatedAt: new Date(),
        });
      }

      console.log(
        `✅ Admin ${status} KYC request for user: ${
          (kycRequest.userId as any)?.email || "Unknown"
        }`
      );

      res.json({
        message: `KYC request ${status} successfully`,
        request: kycRequest,
      });
    } catch (error) {
      console.error("❌ Update KYC request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all deposit requests (admin only)
router.get(
  "/deposit-requests",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const depositRequests = await DepositRequest.find({})
        .populate("userId", "email")
        .sort({ createdAt: -1 });

      console.log(
        `💰 Admin viewing ${depositRequests.length} deposit requests`
      );

      res.json({ requests: depositRequests });
    } catch (error) {
      console.error("❌ Get deposit requests error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update deposit request status (admin only)
router.put(
  "/deposit-requests/:id",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { status, rejectionReason } = req.body;

      if (!["verified", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const depositRequest = await DepositRequest.findById(
        req.params.id
      ).populate("userId", "email");
      if (!depositRequest) {
        return res.status(404).json({ message: "Deposit request not found" });
      }

      depositRequest.status = status;
      depositRequest.verificationDate = new Date();
      depositRequest.verifiedBy = req.userId
        ? new mongoose.Types.ObjectId(req.userId)
        : null;
      if (rejectionReason) depositRequest.rejectionReason = rejectionReason;
      depositRequest.updatedAt = new Date();

      await depositRequest.save();

      // If approved, update user's balance and create transaction
      if (status === "verified") {
        // Find or create user's asset balance
        let assetBalance = await AssetBalance.findOne({
          userId: depositRequest.userId,
        });

        if (!assetBalance) {
          assetBalance = new AssetBalance({
            userId: depositRequest.userId,
            bitcoin: 0,
            ethereum: 0,
            solana: 0,
            totalBalance: 0,
          });
        }

        // Map asset symbol to balance field
        const assetField =
          depositRequest.asset.toLowerCase() === "btc"
            ? "bitcoin"
            : depositRequest.asset.toLowerCase() === "eth"
            ? "ethereum"
            : depositRequest.asset.toLowerCase() === "sol"
            ? "solana"
            : "bitcoin";

        // Update balance
        assetBalance[assetField] += depositRequest.amount;
        assetBalance.totalBalance += depositRequest.amount;
        assetBalance.updatedAt = new Date();
        await assetBalance.save();

        // Create transaction record
        const transaction = new Transaction({
          userId: depositRequest.userId,
          type: "deposit",
          asset: depositRequest.asset,
          amount: depositRequest.amount,
          status: "completed",
          description: `Deposit of ${depositRequest.amount} ${depositRequest.asset} verified by admin`,
          transactionHash: depositRequest.transactionHash,
          relatedRequestId: depositRequest._id,
          completedAt: new Date(),
        });
        await transaction.save();

        console.log(
          `💰 Updated user balance: +${depositRequest.amount} ${depositRequest.asset}`
        );
      }

      console.log(
        `✅ Admin ${status} deposit request for user: ${
          (depositRequest.userId as any)?.email || "Unknown"
        }`
      );

      res.json({
        message: `Deposit request ${status} successfully`,
        request: depositRequest,
      });
    } catch (error) {
      console.error("❌ Update deposit request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all withdrawal requests (admin only)
router.get(
  "/withdrawal-requests",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const withdrawalRequests = await WithdrawalRequest.find({})
        .populate("userId", "email")
        .sort({ createdAt: -1 });

      console.log(
        `💸 Admin viewing ${withdrawalRequests.length} withdrawal requests`
      );

      res.json({ requests: withdrawalRequests });
    } catch (error) {
      console.error("❌ Get withdrawal requests error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update withdrawal request status (admin only)
router.put(
  "/withdrawal-requests/:id",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { status, rejectionReason, transactionHash } = req.body;

      if (!["approved", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const withdrawalRequest = await WithdrawalRequest.findById(
        req.params.id
      ).populate("userId", "email");
      if (!withdrawalRequest) {
        return res
          .status(404)
          .json({ message: "Withdrawal request not found" });
      }

      withdrawalRequest.status = status;
      if (status === "approved") {
        withdrawalRequest.approvalDate = new Date();
      } else if (status === "completed") {
        withdrawalRequest.completionDate = new Date();
        if (transactionHash)
          withdrawalRequest.transactionHash = transactionHash;
      }
      withdrawalRequest.approvedBy = req.userId
        ? new mongoose.Types.ObjectId(req.userId)
        : null;
      if (rejectionReason) withdrawalRequest.rejectionReason = rejectionReason;
      withdrawalRequest.updatedAt = new Date();

      await withdrawalRequest.save();

      // If approved, deduct from user's balance and create transaction
      if (status === "approved") {
        const assetBalance = await AssetBalance.findOne({
          userId: withdrawalRequest.userId,
        });

        if (assetBalance) {
          const assetField =
            withdrawalRequest.asset.toLowerCase() === "btc"
              ? "bitcoin"
              : withdrawalRequest.asset.toLowerCase() === "eth"
              ? "ethereum"
              : withdrawalRequest.asset.toLowerCase() === "sol"
              ? "solana"
              : "bitcoin";

          // Check if user has sufficient balance
          if (assetBalance[assetField] >= withdrawalRequest.amount) {
            // Deduct from balance
            assetBalance[assetField] -= withdrawalRequest.amount;
            assetBalance.totalBalance -= withdrawalRequest.amount;
            assetBalance.updatedAt = new Date();
            await assetBalance.save();

            // Create transaction record
            const transaction = new Transaction({
              userId: withdrawalRequest.userId,
              type: "withdrawal",
              asset: withdrawalRequest.asset,
              amount: withdrawalRequest.amount,
              status: "completed",
              description: `Withdrawal of ${withdrawalRequest.amount} ${withdrawalRequest.asset} approved by admin`,
              transactionHash: withdrawalRequest.transactionHash,
              relatedRequestId: withdrawalRequest._id,
              completedAt: new Date(),
            });
            await transaction.save();

            console.log(
              `💸 Updated user balance: -${withdrawalRequest.amount} ${withdrawalRequest.asset}`
            );
          } else {
            console.log(
              `❌ Insufficient balance for withdrawal: ${withdrawalRequest.amount} ${withdrawalRequest.asset}`
            );
            return res.status(400).json({
              message: "Insufficient balance for this withdrawal",
            });
          }
        } else {
          console.log(`❌ No balance record found for user`);
          return res.status(404).json({
            message: "User balance record not found",
          });
        }
      }

      console.log(
        `✅ Admin ${status} withdrawal request for user: ${
          (withdrawalRequest.userId as any)?.email || "Unknown"
        }`
      );

      res.json({
        message: `Withdrawal request ${status} successfully`,
        request: withdrawalRequest,
      });
    } catch (error) {
      console.error("❌ Update withdrawal request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
