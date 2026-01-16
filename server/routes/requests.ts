import { Router } from "express";
import { KYCRequest } from "../models/KYCRequest";
import { DepositRequest } from "../models/DepositRequest";
import { WithdrawalRequest } from "../models/WithdrawalRequest";
import { ProcessingFeePayment } from "../models/ProcessingFeePayment";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Submit KYC Request
router.post("/kyc", authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      phoneNumber,
      address,
      city,
      country,
      postalCode,
      documentType,
      documentNumber,
    } = req.body;

    // Check if user already has a pending or approved KYC request
    const existingKyc = await KYCRequest.findOne({
      userId: req.userId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingKyc) {
      return res.status(400).json({
        message:
          existingKyc.status === "approved"
            ? "KYC already approved"
            : "KYC request already pending",
      });
    }

    const kycRequest = new KYCRequest({
      userId: req.userId,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      phoneNumber,
      address,
      city,
      country,
      postalCode,
      documentType,
      documentNumber,
    });

    await kycRequest.save();

    console.log(`📋 New KYC request submitted by user: ${req.user.email}`);

    res.status(201).json({
      message: "KYC request submitted successfully",
      request: kycRequest,
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit Deposit Request
router.post("/deposit", authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      amount,
      asset,
      transactionHash,
      walletAddress,
      paymentMethod,
      notes,
    } = req.body;

    const depositRequest = new DepositRequest({
      userId: req.userId,
      amount,
      asset,
      transactionHash,
      walletAddress,
      paymentMethod,
      notes,
    });

    await depositRequest.save();

    console.log(
      `💰 New deposit request: $${amount} ${asset} from user: ${req.user.email}`
    );

    res.status(201).json({
      message: "Deposit request submitted successfully",
      request: depositRequest,
    });
  } catch (error) {
    console.error("Deposit submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit Withdrawal Request
router.post("/withdrawal", authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, asset, walletAddress, network, notes } = req.body;

    const withdrawalRequest = new WithdrawalRequest({
      userId: req.userId,
      amount,
      asset,
      walletAddress,
      network,
      notes,
    });

    await withdrawalRequest.save();

    console.log(
      `💸 New withdrawal request: $${amount} ${asset} from user: ${req.user.email}`
    );

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      request: withdrawalRequest,
    });
  } catch (error) {
    console.error("Withdrawal submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit Processing Fee Payment
router.post("/processing-fee", authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if user already has a pending or verified processing fee payment
    const existingPayment = await ProcessingFeePayment.findOne({
      userId: req.userId,
      status: { $in: ["pending", "verified"] },
    });

    if (existingPayment) {
      return res.status(400).json({
        message:
          existingPayment.status === "verified"
            ? "Processing fee already verified"
            : "Processing fee payment already pending",
      });
    }

    const processingFeePayment = new ProcessingFeePayment({
      userId: req.userId,
      amount: 2000,
      asset: "BTC",
      notes: "Withdrawal processing fee payment",
    });

    await processingFeePayment.save();

    console.log(
      `💳 New processing fee payment submitted by user: ${req.user.email}`
    );

    res.status(201).json({
      message: "Processing fee payment submitted successfully",
      payment: processingFeePayment,
    });
  } catch (error) {
    console.error("Processing fee submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's requests
router.get("/my-requests", authenticate, async (req: AuthRequest, res) => {
  try {
    const [kycRequests, depositRequests, withdrawalRequests] =
      await Promise.all([
        KYCRequest.find({ userId: req.userId }).sort({ createdAt: -1 }),
        DepositRequest.find({ userId: req.userId }).sort({ createdAt: -1 }),
        WithdrawalRequest.find({ userId: req.userId }).sort({ createdAt: -1 }),
      ]);

    res.json({
      kyc: kycRequests,
      deposits: depositRequests,
      withdrawals: withdrawalRequests,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
