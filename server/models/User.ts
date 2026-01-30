import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  processingFeePaid: { type: Boolean, default: false },
  processingFeeDepositId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DepositRequest",
  },
  processingFeePaidAt: { type: Date },
  withdrawalRestricted: { type: Boolean, default: false },
  restrictionReason: { type: String },
  restrictionTitle: { type: String },
  restrictionHeading: { type: String },
  restrictionMessage: { type: String },
  restrictedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
