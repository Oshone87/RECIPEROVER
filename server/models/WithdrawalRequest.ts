import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema({
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
  walletAddress: { type: String, required: true },
  network: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  requestDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  completionDate: { type: Date },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectionReason: { type: String },
  transactionHash: { type: String }, // Set when withdrawal is processed
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const WithdrawalRequest = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema
);
