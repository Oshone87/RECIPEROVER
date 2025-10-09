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

    console.log(
      `📊 Found ${investments.length} investments for user ${req.userId}`
    );
    res.json({ investments });
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
    const aprRates = { Bronze: 24, Silver: 30, Gold: 36 };
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

    res.json({ investment });
  } catch (error) {
    console.error("❌ Get investment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
