import { Router } from "express";
import { AssetBalance } from "../models/AssetBalance";
import { Transaction } from "../models/Transaction";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Get user's asset balances
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    let userBalance = await AssetBalance.findOne({ userId: req.userId });

    // Create initial balance if doesn't exist
    if (!userBalance) {
      userBalance = new AssetBalance({
        userId: req.userId,
        bitcoin: 0,
        ethereum: 0,
        solana: 0,
        totalBalance: 0,
      });
      await userBalance.save();
      console.log(`✅ Created initial balance for user ${req.userId}`);
    }

    res.json({
      balances: {
        bitcoin: userBalance.bitcoin,
        ethereum: userBalance.ethereum,
        solana: userBalance.solana,
        totalBalance: userBalance.totalBalance,
      },
    });
  } catch (error) {
    console.error("❌ Get balances error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Record deposit (for admin or automated systems)
router.post("/deposit", authenticate, async (req: AuthRequest, res) => {
  try {
    const { asset, amount } = req.body;

    if (!["bitcoin", "ethereum", "solana"].includes(asset)) {
      return res.status(400).json({ message: "Invalid asset type" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const userBalance = await AssetBalance.findOne({ userId: req.userId });
    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }

    // Add to asset balance
    const currentBalance = userBalance[
      asset as keyof typeof userBalance
    ] as number;
    (userBalance as any)[asset] = currentBalance + amount;
    userBalance.totalBalance =
      userBalance.bitcoin + userBalance.ethereum + userBalance.solana;
    userBalance.updatedAt = new Date();

    await userBalance.save();

    console.log(`💰 Deposit: +${amount} ${asset} for user ${req.userId}`);

    res.json({
      message: `Successfully deposited ${amount} ${asset}`,
      balances: {
        bitcoin: userBalance.bitcoin,
        ethereum: userBalance.ethereum,
        solana: userBalance.solana,
        totalBalance: userBalance.totalBalance,
      },
    });
  } catch (error) {
    console.error("❌ Deposit error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Record withdrawal (requires KYC verification)
router.post("/withdraw", authenticate, async (req: AuthRequest, res) => {
  try {
    const { asset, amount } = req.body;

    // Check if user is KYC verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "KYC verification required for withdrawals",
      });
    }

    if (!["bitcoin", "ethereum", "solana"].includes(asset)) {
      return res.status(400).json({ message: "Invalid asset type" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const userBalance = await AssetBalance.findOne({ userId: req.userId });
    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }

    // Check sufficient balance
    const currentBalance = userBalance[
      asset as keyof typeof userBalance
    ] as number;
    if (currentBalance < amount) {
      return res.status(400).json({
        message: `Insufficient ${asset} balance. Available: ${currentBalance}`,
      });
    }

    // Deduct from asset balance
    (userBalance as any)[asset] = currentBalance - amount;
    userBalance.totalBalance =
      userBalance.bitcoin + userBalance.ethereum + userBalance.solana;
    userBalance.updatedAt = new Date();

    await userBalance.save();

    console.log(`💸 Withdrawal: -${amount} ${asset} for user ${req.userId}`);

    res.json({
      message: `Successfully withdrew ${amount} ${asset}`,
      balances: {
        bitcoin: userBalance.bitcoin,
        ethereum: userBalance.ethereum,
        solana: userBalance.solana,
        totalBalance: userBalance.totalBalance,
      },
    });
  } catch (error) {
    console.error("❌ Withdrawal error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's transaction history
router.get("/transactions", authenticate, async (req: AuthRequest, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      transactions: transactions.map((tx) => ({
        id: tx._id,
        type: tx.type,
        asset: tx.asset,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        transactionHash: tx.transactionHash,
        date: tx.createdAt,
        completedAt: tx.completedAt,
      })),
    });
  } catch (error) {
    console.error("❌ Get transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
