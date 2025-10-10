import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "investment", "earning"],
    required: true,
  },
  asset: {
    type: String,
    enum: ["BTC", "ETH", "SOL", "USDC"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  description: {
    type: String,
    required: true,
  },
  transactionHash: {
    type: String,
  },
  relatedRequestId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
