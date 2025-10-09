import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tier: { type: String, enum: ["Bronze", "Silver", "Gold"], required: true },
  amount: { type: Number, required: true },
  asset: {
    type: String,
    enum: ["bitcoin", "ethereum", "solana"],
    required: true,
  },
  period: { type: Number, required: true }, // days
  apr: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  dailyReturns: { type: Number, default: 0 },
  totalReturns: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Investment = mongoose.model("Investment", investmentSchema);
