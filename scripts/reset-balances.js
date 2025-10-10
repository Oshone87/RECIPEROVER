// Script to reset all user balances to zero
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/recipe-rover-investment");

const AssetBalance = mongoose.model(
  "AssetBalance",
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bitcoin: { type: Number, default: 0 },
    ethereum: { type: Number, default: 0 },
    solana: { type: Number, default: 0 },
    totalBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  })
);

async function resetBalances() {
  try {
    console.log("🔍 Finding all asset balances...");

    const balances = await AssetBalance.find({});
    console.log(`Found ${balances.length} balance records`);

    for (const balance of balances) {
      console.log(
        `Before reset - User ${balance.userId}: BTC=${balance.bitcoin}, ETH=${balance.ethereum}, SOL=${balance.solana}, Total=${balance.totalBalance}`
      );
    }

    // Reset all balances to zero
    const result = await AssetBalance.updateMany(
      {},
      {
        $set: {
          bitcoin: 0,
          ethereum: 0,
          solana: 0,
          totalBalance: 0,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✅ Reset ${result.modifiedCount} balance records to zero`);

    // Verify the reset
    const updatedBalances = await AssetBalance.find({});
    for (const balance of updatedBalances) {
      console.log(
        `After reset - User ${balance.userId}: BTC=${balance.bitcoin}, ETH=${balance.ethereum}, SOL=${balance.solana}, Total=${balance.totalBalance}`
      );
    }

    console.log("✅ All balances have been reset to zero");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error resetting balances:", error);
    mongoose.connection.close();
  }
}

resetBalances();
