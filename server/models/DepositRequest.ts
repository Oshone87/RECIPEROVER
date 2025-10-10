import mongoose from "mongoose";

const depositRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  asset: {
    type: String,
    enum: ["BTC", "ETH", "BNB", "SOL", "USDT"],
    required: true,
  },
  transactionHash: { type: String },
  walletAddress: { type: String },
  paymentMethod: { type: String },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected", "completed"],
    default: "pending",
  },
  requestDate: { type: Date, default: Date.now },
  verificationDate: { type: Date },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectionReason: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DepositRequest = mongoose.model(
  "DepositRequest",
  depositRequestSchema
);
