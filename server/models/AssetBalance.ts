import mongoose from "mongoose";

const assetBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Crypto balances
  bitcoin: { type: Number, default: 0 },
  ethereum: { type: Number, default: 0 },
  solana: { type: Number, default: 0 },
  // Stock balances (USD-denominated)
  tesla: { type: Number, default: 0 },
  apple: { type: Number, default: 0 },
  google: { type: Number, default: 0 },
  amazon: { type: Number, default: 0 },
  microsoft: { type: Number, default: 0 },
  nvidia: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export const AssetBalance = mongoose.model("AssetBalance", assetBalanceSchema);
