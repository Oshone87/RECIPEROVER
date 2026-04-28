import { Router } from "express";
import { AssetBalance } from "../models/AssetBalance";
import { Transaction } from "../models/Transaction";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Valid asset types (crypto + stocks)
const VALID_CRYPTO = ["bitcoin", "ethereum", "solana"];
const VALID_STOCKS = ["tesla", "apple", "google", "amazon", "microsoft", "nvidia"];
const VALID_ASSETS = [...VALID_CRYPTO, ...VALID_STOCKS];

// Helper to calculate total balance across all assets
function calcTotalBalance(balance: any): number {
  return (
    (balance.bitcoin || 0) + (balance.ethereum || 0) + (balance.solana || 0) +
    (balance.tesla || 0) + (balance.apple || 0) + (balance.google || 0) +
    (balance.amazon || 0) + (balance.microsoft || 0) + (balance.nvidia || 0)
  );
}

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
        tesla: 0,
        apple: 0,
        google: 0,
        amazon: 0,
        microsoft: 0,
        nvidia: 0,
        totalBalance: 0,
      });
      await userBalance.save();
      console.log(`✅ Created initial balance for user ${req.userId}`);
    }

    res.json({
      balances: {
        // Crypto
        bitcoin: userBalance.bitcoin,
        ethereum: userBalance.ethereum,
        solana: userBalance.solana,
        // Stocks
        tesla: (userBalance as any).tesla || 0,
        apple: (userBalance as any).apple || 0,
        google: (userBalance as any).google || 0,
        amazon: (userBalance as any).amazon || 0,
        microsoft: (userBalance as any).microsoft || 0,
        nvidia: (userBalance as any).nvidia || 0,
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

    if (!VALID_ASSETS.includes(asset)) {
      return res.status(400).json({ message: `Invalid asset type. Valid: ${VALID_ASSETS.join(", ")}` });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const userBalance = await AssetBalance.findOne({ userId: req.userId });
    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }

    // Add to asset balance
    const currentBalance = (userBalance as any)[asset] as number || 0;
    (userBalance as any)[asset] = currentBalance + amount;
    userBalance.totalBalance = calcTotalBalance(userBalance);
    userBalance.updatedAt = new Date();

    await userBalance.save();

    console.log(`💰 Deposit: +${amount} ${asset} for user ${req.userId}`);

    res.json({
      message: `Successfully deposited ${amount} ${asset}`,
      balances: {
        bitcoin: userBalance.bitcoin,
        ethereum: userBalance.ethereum,
        solana: userBalance.solana,
        tesla: (userBalance as any).tesla || 0,
        apple: (userBalance as any).apple || 0,
        google: (userBalance as any).google || 0,
        amazon: (userBalance as any).amazon || 0,
        microsoft: (userBalance as any).microsoft || 0,
        nvidia: (userBalance as any).nvidia || 0,
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

    if (!VALID_ASSETS.includes(asset)) {
      return res.status(400).json({ message: `Invalid asset type. Valid: ${VALID_ASSETS.join(", ")}` });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const userBalance = await AssetBalance.findOne({ userId: req.userId });
    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }

    // Check sufficient balance
    const currentBalance = (userBalance as any)[asset] as number || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        message: `Insufficient ${asset} balance. Available: ${currentBalance}`,
      });
    }

    // Deduct from asset balance
    (userBalance as any)[asset] = currentBalance - amount;
    userBalance.totalBalance = calcTotalBalance(userBalance);
    userBalance.updatedAt = new Date();

    await userBalance.save();

    console.log(`💸 Withdrawal: -${amount} ${asset} for user ${req.userId}`);

    res.json({
      message: `Successfully withdrew ${amount} ${asset}`,
      balances: {
        bitcoin: userBalance.bitcoin,
        ethereum: userBalance.ethereum,
        solana: userBalance.solana,
        tesla: (userBalance as any).tesla || 0,
        apple: (userBalance as any).apple || 0,
        google: (userBalance as any).google || 0,
        amazon: (userBalance as any).amazon || 0,
        microsoft: (userBalance as any).microsoft || 0,
        nvidia: (userBalance as any).nvidia || 0,
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
