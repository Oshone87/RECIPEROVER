// Vercel serverless function with comprehensive functionality
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// AssetBalance Schema
const assetBalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bitcoin: { type: Number, default: 0 },
  ethereum: { type: Number, default: 0 },
  solana: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// KYC Request Schema
const kycRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nationality: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  documentType: { type: String, required: true },
  documentNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminNotes: { type: String },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const AssetBalance =
  mongoose.models.AssetBalance ||
  mongoose.model("AssetBalance", assetBalanceSchema);
const KYCRequest =
  mongoose.models.KYCRequest || mongoose.model("KYCRequest", kycRequestSchema);

// Investment Schema (with APR and completion timestamp)
const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tier: { type: String, required: true },
  asset: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: Number, required: true }, // in days
  apr: { type: Number }, // APR used for earnings math (see create investment)
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

const Investment =
  mongoose.models.Investment || mongoose.model("Investment", investmentSchema);

// Deposit Request Schema
const depositRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  asset: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  transactionHash: { type: String },
  walletAddress: { type: String },
  receipt: {
    referenceId: String,
    type: { type: String, default: "deposit" },
    asset: String,
    amount: Number,
    network: String,
    senderAddress: String,
    recipientAddress: String,
    createdAt: { type: Date, default: Date.now },
  },
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminNotes: { type: String },
});

const DepositRequest =
  mongoose.models.DepositRequest ||
  mongoose.model("DepositRequest", depositRequestSchema);

// Withdrawal Request Schema
const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  asset: { type: String, required: true },
  walletAddress: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  transactionHash: { type: String },
  receipt: {
    referenceId: String,
    type: { type: String, default: "withdrawal" },
    asset: String,
    amount: Number,
    network: String,
    senderAddress: String,
    recipientAddress: String,
    createdAt: { type: Date, default: Date.now },
  },
  submittedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  adminNotes: { type: String },
});

const WithdrawalRequest =
  mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequest", withdrawalRequestSchema);

// Database connection
let isConnected = false;

async function connectDatabase() {
  if (isConnected) return;

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    // Enable comprehensive CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma"
    );
    res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    await connectDatabase();

    // Platform wallets and helpers
    const normalizeAssetCode = (asset: string): "BTC" | "ETH" | "SOL" => {
      const raw = (asset || "").toString().trim().toLowerCase();
      if (raw.startsWith("btc") || raw.includes("bitcoin")) return "BTC";
      if (raw.startsWith("eth") || raw.includes("ethereum")) return "ETH";
      if (raw.startsWith("sol") || raw.includes("solana")) return "SOL";
      // default safe fallback
      return "BTC";
    };

    const getPlatformWallet = (asset: string): string => {
      const a = normalizeAssetCode(asset);
      const envMap: Record<string, string | undefined> = {
        BTC: process.env.PLATFORM_WALLET_BTC,
        ETH: process.env.PLATFORM_WALLET_ETH,
        SOL: process.env.PLATFORM_WALLET_SOL,
      };
      const fallbackMap: Record<string, string> = {
        BTC: "3H2CW2w8eiCnytfF57Tyk4sxxZwbr9aQCx",
        ETH: "0x275CDF33a56400f3164AA34831027f7b5A42ABb4",
        SOL: "8XoKp527ERexxMC9QxL4soXHRvwKdCj2wmNK3iBdNxVE",
      };
      return envMap[a] || fallbackMap[a] || "";
    };

    const randomHex = (len: number) =>
      [...Array(len)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
    const randomBase58 = (len: number) => {
      const alphabet =
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let s = "";
      for (let i = 0; i < len; i++)
        s += alphabet[Math.floor(Math.random() * alphabet.length)];
      return s;
    };
    const generateEthAddress = () => `0x${randomHex(40)}`;
    const generateBtcAddress = () => {
      if (Math.random() < 0.5) return `bc1q${randomBase58(30)}`;
      const prefix = Math.random() < 0.5 ? "1" : "3";
      return `${prefix}${randomBase58(33)}`;
    };
    const generateSolAddress = () => randomBase58(44);
    const generateRandomAddressForAsset = (asset: string) => {
      const a = normalizeAssetCode(asset);
      if (a === "ETH") return generateEthAddress();
      if (a === "SOL") return generateSolAddress();
      return generateBtcAddress();
    };
    const generateReferenceId = () => {
      const d = new Date();
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}${String(d.getDate()).padStart(2, "0")}`;
      return `TX-${ymd}-${randomHex(6).toUpperCase()}`;
    };

    // Utility: map tier to APR matching the frontend math (linear APR/365 without /100)
    const aprFromTier = (tier: string | undefined): number => {
      const t = (tier || "").toLowerCase();
      if (t.includes("platinum")) return 36;
      if (t.includes("gold")) return 30;
      if (t.includes("silver")) return 24;
      return 24;
    };

    // Utility: asset field mapping
    const getAssetField = (asset: string, bal: any) => {
      const fieldMap: Record<string, keyof typeof bal> = {
        BTC: "bitcoin" as any,
        ETH: "ethereum" as any,
        SOL: "solana" as any,
        bitcoin: "bitcoin" as any,
        ethereum: "ethereum" as any,
        solana: "solana" as any,
      };
      return (fieldMap as any)[asset] || null;
    };

    // Idempotent settlement: mark matured investments completed and credit balances once
    const settleMaturedInvestments = async (userId: string) => {
      const now = new Date();
      // Find candidates first (active only)
      const candidates = await Investment.find({ userId, status: "active" });
      if (!candidates.length) return;

      let creditByAsset: Record<string, number> = {
        bitcoin: 0,
        ethereum: 0,
        solana: 0,
      };

      // For each candidate, check maturity and atomically flip to completed to avoid double payout
      for (const inv of candidates) {
        const start = inv.createdAt ? new Date(inv.createdAt) : now;
        const end = new Date(
          start.getTime() + Number(inv.period || 0) * 24 * 60 * 60 * 1000
        );
        if (now.getTime() >= end.getTime()) {
          // Try to atomically set to completed only if still active
          const updated = await Investment.findOneAndUpdate(
            { _id: inv._id, status: "active" },
            {
              $set: {
                status: "completed",
                updatedAt: new Date(),
                completedAt: new Date(),
              },
            },
            { new: false }
          );
          // If updated is not null, the change happened now; compute payout once
          if (updated) {
            const apr = Number(inv.apr || aprFromTier(inv.tier));
            const dailyRate = apr / 365; // matches frontend math (no /100)
            const earnings =
              Number(inv.amount || 0) * dailyRate * Number(inv.period || 0);
            const totalReturn = Number(inv.amount || 0) + earnings;
            const assetKey = (inv.asset || "").toLowerCase();
            if (assetKey.includes("btc") || assetKey === "bitcoin") {
              creditByAsset.bitcoin += totalReturn;
            } else if (assetKey.includes("eth") || assetKey === "ethereum") {
              creditByAsset.ethereum += totalReturn;
            } else if (assetKey.includes("sol") || assetKey === "solana") {
              creditByAsset.solana += totalReturn;
            } else {
              // default to totalBalance only if unknown asset (rare)
              creditByAsset.bitcoin += 0; // no-op, but keeps structure consistent
            }
          }
        }
      }

      // Apply credits if any
      const totalCredit = Object.values(creditByAsset).reduce(
        (a, b) => a + b,
        0
      );
      if (totalCredit > 0) {
        const bal = await AssetBalance.findOne({ userId });
        if (bal) {
          // @ts-ignore dynamic index
          bal.bitcoin = Number(bal.bitcoin || 0) + creditByAsset.bitcoin;
          // @ts-ignore dynamic index
          bal.ethereum = Number(bal.ethereum || 0) + creditByAsset.ethereum;
          // @ts-ignore dynamic index
          bal.solana = Number(bal.solana || 0) + creditByAsset.solana;
          bal.totalBalance = Number(bal.totalBalance || 0) + totalCredit;
          await bal.save();
        }
      }
    };

    // Health endpoint
    if (req.url === "/health") {
      return res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        mongodb: "connected",
      });
    }

    // Registration endpoint - support both /auth/register and /api/auth/register
    if (
      (req.url === "/auth/register" || req.url === "/api/auth/register") &&
      req.method === "POST"
    ) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists. Please use a different email.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
      });

      await user.save();

      // Create asset balance record with $0 balance
      const assetBalance = new AssetBalance({
        userId: user._id,
        bitcoin: 0,
        ethereum: 0,
        solana: 0,
        totalBalance: 0,
      });

      await assetBalance.save();

      // Generate JWT token so the user is authenticated right after signup
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified,
        },
      });
    }

    // Login endpoint - support both /auth/login and /api/auth/login
    if (
      (req.url === "/auth/login" || req.url === "/api/auth/login") &&
      req.method === "POST"
    ) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check for hardcoded admin credentials
      if (email === "davidanyia72@gmail.com" && password === "72@gmail.com") {
        // Generate JWT token for admin
        const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
        const token = jwt.sign({ userId: "admin" }, JWT_SECRET, {
          expiresIn: "7d",
        });

        return res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: "admin",
            email: "davidanyia72@gmail.com",
            role: "admin",
            kycStatus: "approved",
            isVerified: true,
          },
        });
      }

      // Find regular user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      // Generate JWT token
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          isVerified: user.isVerified,
        },
      });
    }

    // Get current user endpoint
    if (
      (req.url === "/auth/me" || req.url === "/api/auth/me") &&
      req.method === "GET"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId === "admin") {
          return res.status(200).json({
            user: {
              id: "admin",
              email: "davidanyia72@gmail.com",
              role: "admin",
              kycStatus: "approved",
              isVerified: true,
            },
          });
        }
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            isVerified: user.isVerified,
          },
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get all users endpoint (admin only). Support both /api/admin/users and /api/users
    if (
      (req.url === "/api/users" || req.url === "/api/admin/users") &&
      req.method === "GET"
    ) {
      // Check authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Check if it's admin
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }

        // Get all users (excluding passwords) shaped for admin UI
        const users = await User.find({}, { password: 0 }).sort({
          createdAt: -1,
        });

        return res.status(200).json({
          message: "Users retrieved successfully",
          users: users.map((u) => ({
            _id: u._id,
            email: u.email,
            isVerified: u.isVerified,
            isDisabled: (u as any).isDisabled || false,
            kycStatus: u.kycStatus,
            createdAt: u.createdAt,
          })),
        });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // KYC submission endpoint (support both with and without /api prefix)
    if (
      (req.url === "/api/requests/kyc" || req.url === "/requests/kyc") &&
      req.method === "POST"
    ) {
      const {
        firstName,
        lastName,
        nationality,
        phoneNumber,
        address,
        city,
        country,
        postalCode,
        documentType,
        documentNumber,
      } = req.body;

      // Validate required fields
      if (
        !firstName ||
        !lastName ||
        !nationality ||
        !phoneNumber ||
        !address ||
        !city ||
        !country ||
        !postalCode ||
        !documentType ||
        !documentNumber
      ) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      // Check authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Create KYC request
        const kycRequest = new KYCRequest({
          userId,
          firstName,
          lastName,
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

        return res.status(201).json({
          message: "KYC request submitted successfully",
          requestId: kycRequest._id,
        });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get user balances endpoint
    if (req.url === "/api/balances" && req.method === "GET") {
      // Check authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        // If it's the admin token, return zero balances without DB lookup
        if (userId === "admin") {
          return res.status(200).json({
            message: "Balances retrieved successfully",
            balances: {
              bitcoin: 0,
              ethereum: 0,
              solana: 0,
              totalBalance: 0,
            },
          });
        }

        // First settle any matured investments (idempotent)
        await settleMaturedInvestments(userId);

        // Find user balances
        const balances = await AssetBalance.findOne({ userId });

        if (!balances) {
          // Create default balances if they don't exist
          const newBalances = new AssetBalance({
            userId,
            bitcoin: 0,
            ethereum: 0,
            solana: 0,
            totalBalance: 0,
          });
          await newBalances.save();

          return res.status(200).json({
            message: "Balances retrieved successfully",
            balances: {
              bitcoin: 0,
              ethereum: 0,
              solana: 0,
              totalBalance: 0,
            },
          });
        }

        return res.status(200).json({
          message: "Balances retrieved successfully",
          balances: {
            bitcoin: balances.bitcoin,
            ethereum: balances.ethereum,
            solana: balances.solana,
            totalBalance: balances.totalBalance,
          },
        });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get balance transactions endpoint (user's deposits and withdrawals)
    if (req.url === "/api/balances/transactions" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId === "admin") {
          return res.status(200).json({ transactions: [] });
        }
        const [deposits, withdrawals] = await Promise.all([
          DepositRequest.find({ userId: decoded.userId }).sort({
            submittedAt: -1,
          }),
          WithdrawalRequest.find({ userId: decoded.userId }).sort({
            submittedAt: -1,
          }),
        ]);

        const mapAssetCode = (asset: string) => {
          const map: Record<string, string> = {
            bitcoin: "BTC",
            ethereum: "ETH",
            solana: "SOL",
            BTC: "BTC",
            ETH: "ETH",
            SOL: "SOL",
          };
          return map[asset] || asset?.toUpperCase?.() || asset;
        };

        const depositTx = deposits.map((d: any) => ({
          id: `dep_${d._id}`,
          date: (d.processedAt || d.submittedAt || new Date()).toISOString(),
          type: "deposit",
          asset: mapAssetCode(d.asset),
          amount: d.amount,
          status:
            d.status === "verified"
              ? "completed"
              : d.status === "pending"
              ? "pending"
              : "rejected",
          receipt: d.receipt,
        }));

        const withdrawalTx = withdrawals.map((w: any) => ({
          id: `wd_${w._id}`,
          date: (w.processedAt || w.submittedAt || new Date()).toISOString(),
          type: "withdrawal",
          asset: mapAssetCode(w.asset),
          amount: w.amount,
          status:
            w.status === "completed"
              ? "completed"
              : w.status === "approved"
              ? "approved"
              : w.status === "pending"
              ? "pending"
              : "rejected",
          receipt: w.receipt,
        }));

        const transactions = [...depositTx, ...withdrawalTx].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return res.status(200).json({ transactions });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get investments for current user
    if (req.url === "/api/investments" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId === "admin") {
          // Admin: return all investments
          const investments = await Investment.find({}).sort({ createdAt: -1 });
          return res.status(200).json({ investments });
        }
        // Settle matured before returning user's investments (idempotent, per-user)
        await settleMaturedInvestments(decoded.userId);
        const investments = await Investment.find({
          userId: decoded.userId,
        }).sort({ createdAt: -1 });
        return res.status(200).json({ investments });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Create an investment for current user
    if (req.url === "/api/investments" && req.method === "POST") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId === "admin") {
          return res.status(403).json({ message: "Users only" });
        }

        const { tier, amount, asset, period, apr } = req.body || {};
        if (!tier || !amount || !asset || !period) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate user not disabled
        const dbUser = await User.findById(decoded.userId);
        if (!dbUser) return res.status(404).json({ message: "User not found" });
        if ((dbUser as any).isDisabled) {
          return res.status(403).json({ message: "User account disabled" });
        }

        // Check and deduct from asset balance
        const bal = await AssetBalance.findOne({ userId: decoded.userId });
        if (!bal) {
          return res.status(400).json({ message: "No balances found" });
        }
        const field = getAssetField(asset, bal);
        if (!field) {
          return res.status(400).json({ message: "Invalid asset" });
        }
        // @ts-ignore dynamic index
        const available = Number(bal[field] || 0);
        if (available < amount) {
          return res
            .status(400)
            .json({ message: "Insufficient asset balance" });
        }
        // Deduct the investment amount from the asset and total balance
        // @ts-ignore dynamic index
        bal[field] = available - amount;
        bal.totalBalance = Math.max(0, Number(bal.totalBalance || 0) - amount);
        await bal.save();

        const inv = new Investment({
          userId: decoded.userId,
          tier,
          amount,
          asset,
          period,
          apr: Number(apr || aprFromTier(tier)),
          status: "active",
        });
        await inv.save();

        return res.status(201).json({
          message: "Investment created",
          investment: inv,
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: disable/enable a user
    if (req.url?.startsWith("/api/admin/users/") && req.method === "PUT") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const parts = req.url.split("/");
        const userId = parts[parts.length - 1];
        const { disabled } = req.body || {};
        await User.findByIdAndUpdate(userId, { isDisabled: !!disabled });
        return res.status(200).json({ message: "User updated" });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: delete a user (and related data)
    if (req.url === "/api/admin/users" && req.method === "DELETE") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const { userId } = req.body || {};
        if (!userId)
          return res.status(400).json({ message: "userId required" });
        await Promise.all([
          User.findByIdAndDelete(userId),
          AssetBalance.deleteMany({ userId }),
          Investment.deleteMany({ userId }),
          DepositRequest.deleteMany({ userId }),
          WithdrawalRequest.deleteMany({ userId }),
          KYCRequest.deleteMany({ userId }),
        ]);
        return res.status(200).json({ message: "User deleted" });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Platform stats (admin only) - return shape expected by frontend
    if (req.url === "/api/admin/stats" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }

        const totalUsers = await User.countDocuments({});
        const activeUsers = await User.countDocuments({ isVerified: true });
        const pendingKyc = await KYCRequest.countDocuments({
          status: "pending",
        });
        const pendingDeposits = await DepositRequest.countDocuments({
          status: "pending",
        });
        const pendingWithdrawals = await WithdrawalRequest.countDocuments({
          status: "pending",
        });
        const totalInvestments = await Investment.countDocuments({});

        // Sum totalBalance across users
        const agg = await AssetBalance.aggregate([
          { $group: { _id: null, total: { $sum: "$totalBalance" } } },
        ]);
        const totalTVL = (agg && agg[0] && agg[0].total) || 0;

        return res.status(200).json({
          stats: {
            totalUsers,
            activeUsers,
            totalPlatformValue: totalTVL,
            totalInvestments,
            pendingWithdrawals,
            pendingDeposits,
            pendingKyc,
          },
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get KYC requests (admin only)
    if (req.url === "/api/admin/kyc-requests" && req.method === "GET") {
      // Check authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Check if it's admin
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }

        // Get all KYC requests with user information
        const kycRequests = await KYCRequest.find({})
          .populate("userId", "email")
          .sort({ submittedAt: -1 });

        return res.status(200).json({
          message: "KYC requests retrieved successfully",
          requests: kycRequests.map((r) => ({
            _id: r._id,
            userId: r.userId, // populated with { email }
            firstName: r.firstName,
            lastName: r.lastName,
            status: r.status,
            submissionDate: r.submittedAt,
          })),
        });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Update KYC request (admin only)
    if (
      req.url?.startsWith("/api/admin/kyc-requests/") &&
      req.method === "PUT"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const id = req.url.split("/").pop();
        const { status, rejectionReason } = req.body || {};
        const kyc = await KYCRequest.findByIdAndUpdate(
          id,
          { status, processedAt: new Date(), adminNotes: rejectionReason },
          { new: true }
        );
        if (kyc && status === "approved") {
          await User.findByIdAndUpdate(kyc.userId, {
            isVerified: true,
            kycStatus: "approved",
          });
        }
        if (kyc && status === "rejected") {
          await User.findByIdAndUpdate(kyc.userId, {
            isVerified: false,
            kycStatus: "rejected",
          });
        }
        return res.status(200).json({ message: "KYC updated" });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Submit Deposit (user) (support both with and without /api prefix)
    if (
      (req.url === "/api/requests/deposit" ||
        req.url === "/requests/deposit") &&
      req.method === "POST"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const { amount, asset, transactionHash, senderAddress, network } =
          req.body || {};
        if (!amount || !asset) {
          return res.status(400).json({ message: "Missing fields" });
        }
        const referenceId = generateReferenceId();
        const platformAddr = getPlatformWallet(asset);
        const reqDoc = new DepositRequest({
          userId: decoded.userId,
          amount,
          asset,
          transactionHash,
          walletAddress: senderAddress,
          receipt: {
            referenceId,
            type: "deposit",
            asset,
            amount,
            network: network || String(asset || "").toUpperCase(),
            senderAddress: senderAddress || "",
            recipientAddress: platformAddr,
            createdAt: new Date(),
          },
        });
        await reqDoc.save();
        return res
          .status(201)
          .json({ message: "Deposit submitted", referenceId });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: Get Deposit Requests
    if (req.url === "/api/admin/deposit-requests" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const reqs = await DepositRequest.find({})
          .populate("userId", "email")
          .sort({ submittedAt: -1 });
        return res.status(200).json({
          requests: reqs.map((r) => ({
            _id: r._id,
            userId: r.userId,
            amount: r.amount,
            asset: r.asset,
            status: r.status,
            submissionDate: r.submittedAt,
            transactionHash: r.transactionHash,
          })),
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: Update Deposit Request
    if (
      req.url?.startsWith("/api/admin/deposit-requests/") &&
      req.method === "PUT"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const id = req.url.split("/").pop();
        const { status, rejectionReason } = req.body || {};
        const doc = await DepositRequest.findByIdAndUpdate(
          id,
          { status, processedAt: new Date(), adminNotes: rejectionReason },
          { new: true }
        );
        if (doc && status === "verified") {
          // Credit user's balance
          const bal = await AssetBalance.findOne({ userId: doc.userId });
          if (bal) {
            const fieldMap: Record<string, keyof typeof bal> = {
              BTC: "bitcoin" as any,
              ETH: "ethereum" as any,
              SOL: "solana" as any,
              bitcoin: "bitcoin" as any,
              ethereum: "ethereum" as any,
              solana: "solana" as any,
            };
            const field = (fieldMap as any)[doc.asset] || "totalBalance";
            // @ts-ignore dynamic index
            bal[field] = (bal[field] || 0) + doc.amount;
            bal.totalBalance = (bal.totalBalance || 0) + doc.amount;
            await bal.save();
          }
        }
        return res.status(200).json({ message: "Deposit updated" });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Submit Withdrawal (user) (support both with and without /api prefix)
    if (
      (req.url === "/api/requests/withdrawal" ||
        req.url === "/requests/withdrawal") &&
      req.method === "POST"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const { amount, asset, walletAddress, network } = req.body || {};
        if (!amount || !asset) {
          return res.status(400).json({ message: "Missing fields" });
        }

        // Enforce asset-specific balance availability before allowing request
        const bal = await AssetBalance.findOne({ userId: decoded.userId });
        if (!bal) {
          return res.status(400).json({ message: "No balances found" });
        }
        const fieldMap: Record<string, keyof typeof bal> = {
          BTC: "bitcoin" as any,
          ETH: "ethereum" as any,
          SOL: "solana" as any,
          bitcoin: "bitcoin" as any,
          ethereum: "ethereum" as any,
          solana: "solana" as any,
        };
        const field = (fieldMap as any)[asset] || null;
        if (!field) {
          return res.status(400).json({ message: "Invalid asset" });
        }
        // @ts-ignore dynamic index
        const available = Number(bal[field] || 0);
        if (available < Number(amount)) {
          return res
            .status(400)
            .json({ message: `Insufficient ${asset} balance` });
        }

        const referenceId = generateReferenceId();
        const platformAddr = getPlatformWallet(asset);
        const randomRecipient = generateRandomAddressForAsset(asset);
        const reqDoc = new WithdrawalRequest({
          userId: decoded.userId,
          amount,
          asset,
          walletAddress,
          receipt: {
            referenceId,
            type: "withdrawal",
            asset,
            amount,
            network: network || String(asset || "").toUpperCase(),
            senderAddress: platformAddr,
            recipientAddress: randomRecipient,
            createdAt: new Date(),
          },
        });
        await reqDoc.save();
        return res
          .status(201)
          .json({ message: "Withdrawal submitted", referenceId });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get current user's requests (kyc, deposits, withdrawals)
    if (req.url === "/api/requests/my-requests" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId === "admin") {
          return res
            .status(200)
            .json({ kyc: [], deposits: [], withdrawals: [] });
        }
        const [kyc, deposits, withdrawals] = await Promise.all([
          KYCRequest.find({ userId: decoded.userId }).sort({ submittedAt: -1 }),
          DepositRequest.find({ userId: decoded.userId }).sort({
            submittedAt: -1,
          }),
          WithdrawalRequest.find({ userId: decoded.userId }).sort({
            submittedAt: -1,
          }),
        ]);
        return res.status(200).json({ kyc, deposits, withdrawals });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: Get Withdrawal Requests
    if (req.url === "/api/admin/withdrawal-requests" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const reqs = await WithdrawalRequest.find({})
          .populate("userId", "email")
          .sort({ submittedAt: -1 });
        return res.status(200).json({
          requests: reqs.map((r) => ({
            _id: r._id,
            userId: r.userId,
            amount: r.amount,
            asset: r.asset,
            walletAddress: r.walletAddress,
            status: r.status,
            submissionDate: r.submittedAt,
            transactionHash: r.transactionHash,
          })),
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: Get Active Investments
    if (req.url?.startsWith("/api/admin/investments") && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        // Default: active only; allow query ?all=1 to include all statuses
        const urlObj = new URL(`http://localhost${req.url}`);
        const includeAll = urlObj.searchParams.get("all") === "1";
        const filter = includeAll ? {} : { status: "active" };
        const list = await Investment.find(filter)
          .populate("userId", "email")
          .sort({ createdAt: -1 });
        return res.status(200).json({
          investments: list.map((inv: any) => ({
            _id: inv._id,
            userId: inv.userId, // populated with { email }
            tier: inv.tier,
            asset: inv.asset,
            amount: inv.amount,
            period: inv.period,
            status: inv.status,
            createdAt: inv.createdAt,
          })),
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Admin: Update Withdrawal Request
    if (
      req.url?.startsWith("/api/admin/withdrawal-requests/") &&
      req.method === "PUT"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.userId !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        const id = req.url.split("/").pop();
        const { status, rejectionReason, transactionHash } = req.body || {};
        const updated = await WithdrawalRequest.findByIdAndUpdate(
          id,
          {
            status,
            processedAt: new Date(),
            adminNotes: rejectionReason,
            transactionHash,
          },
          { new: true }
        );
        // Deduct user's balance when approved or completed
        if (updated && (status === "approved" || status === "completed")) {
          const bal = await AssetBalance.findOne({ userId: updated.userId });
          if (bal) {
            const fieldMap: Record<string, keyof typeof bal> = {
              BTC: "bitcoin" as any,
              ETH: "ethereum" as any,
              SOL: "solana" as any,
              bitcoin: "bitcoin" as any,
              ethereum: "ethereum" as any,
              solana: "solana" as any,
            };
            const field = (fieldMap as any)[updated.asset] || "totalBalance";
            // @ts-ignore dynamic index
            bal[field] = Math.max(0, (bal[field] || 0) - updated.amount);
            bal.totalBalance = Math.max(
              0,
              (bal.totalBalance || 0) - updated.amount
            );
            await bal.save();
          }
        }
        return res.status(200).json({ message: "Withdrawal updated" });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.json({
      message: "API is working",
      url: req.url,
      method: req.method,
    });
  } catch (error: any) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error?.message || String(error),
    });
  }
}
