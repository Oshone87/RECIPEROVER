import { Router } from "express";
import { Investment } from "../models/Investment";
import { AssetBalance } from "../models/AssetBalance";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Get user's investments
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    // Map the investments to include frontend-expected fields
    const mappedInvestments = investments.map((inv) => ({
      id: inv._id.toString(),
      tier: inv.tier,
      asset: inv.asset,
      amount: inv.amount,
      apr: inv.apr,
      period: inv.period,
      startDate: inv.startDate.toISOString(),
      endDate: inv.endDate.toISOString(),
      earned: inv.totalReturns || 0, // Map totalReturns to earned
      status: inv.status,
      progress: inv.dailyReturns || 0, // Map dailyReturns to progress
      createdAt: inv.createdAt,
    }));

    console.log(
      `📊 Found ${investments.length} investments for user ${req.userId}`
    );
    res.json({ investments: mappedInvestments });
  } catch (error) {
    console.error("❌ Get investments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new investment
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { tier, amount, asset, period } = req.body;

    console.log(
      `🔍 Creating investment: ${tier} tier, ${amount} ${asset}, ${period} days`
    );

    // Check if user is KYC verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "KYC verification required before making investments",
      });
    }

    // Check user's asset balance
    const userBalance = await AssetBalance.findOne({ userId: req.userId });
    if (!userBalance) {
      return res.status(400).json({ message: "User balance not found" });
    }

    // Check if user has enough balance in the specific asset
    const assetBalance = userBalance[
      asset as keyof typeof userBalance
    ] as number;
    if (assetBalance < amount) {
      return res.status(400).json({
        message: `Insufficient ${asset} balance. Available: ${assetBalance}, Required: ${amount}`,
      });
    }

    // Calculate APR based on tier
    const aprRates = { Silver: 24, Gold: 30, Platinum: 36 };
    const apr = aprRates[tier as keyof typeof aprRates];

    if (!apr) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + period);

    // Create investment
    const investment = new Investment({
      userId: req.userId,
      tier,
      amount,
      asset,
      period,
      apr,
      startDate,
      endDate,
    });

    await investment.save();

    // Deduct from user's asset balance
    (userBalance as any)[asset] = assetBalance - amount;
    userBalance.totalBalance =
      userBalance.bitcoin + userBalance.ethereum + userBalance.solana;
    await userBalance.save();

    console.log(`✅ Investment created successfully: ${investment._id}`);

    res.status(201).json({
      investment,
      message: `Investment of ${amount} ${asset} created successfully`,
    });
  } catch (error) {
    console.error("❌ Create investment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get specific investment
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    // Map the investment to include frontend-expected fields
    const mappedInvestment = {
      id: investment._id.toString(),
      tier: investment.tier,
      asset: investment.asset,
      amount: investment.amount,
      apr: investment.apr,
      period: investment.period,
      startDate: investment.startDate.toISOString(),
      endDate: investment.endDate.toISOString(),
      earned: investment.totalReturns || 0,
      status: investment.status,
      progress: investment.dailyReturns || 0,
      createdAt: investment.createdAt,
    };

    res.json({ investment: mappedInvestment });
  } catch (error) {
    console.error("❌ Get investment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
