import mongoose from "mongoose";

const assetBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bitcoin: { type: Number, default: 0 },
  ethereum: { type: Number, default: 0 },
  solana: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export const AssetBalance = mongoose.model("AssetBalance", assetBalanceSchema);
