import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface Investment {
  id: string;
  tier: string;
  asset: string;
  amount: number;
  apr: number;
  period: number;
  startDate: string;
  endDate: string;
  earned: number;
  status: "active" | "completed" | "cancelled";
  progress: number;
}

interface Transaction {
  id: string;
  date: string;
  type: "Investment" | "Deposit" | "Withdrawal" | "Earnings";
  asset: string;
  amount: number;
  status: "Completed" | "Pending" | "Active" | "Approved" | "Failed";
  description: string;
}

interface AssetBalance {
  BTC: number;
  ETH: number;
  SOL: number;
}

interface InvestmentContextType {
  balance: number;
  assetBalances: AssetBalance;
  investments: Investment[];
  transactions: Transaction[];
  createInvestment: (
    investment: Omit<
      Investment,
      "id" | "startDate" | "endDate" | "earned" | "status" | "progress"
    >
  ) => boolean;
  getTotalInvested: () => number;
  getTotalEarnings: () => number;
  getActiveInvestments: () => Investment[];
  getAvailableBalance: () => number;
  getAssetBalance: (asset: string) => number;
  updateAssetBalance: (asset: string, amount: number) => void;
  withdraw: (amount: number, asset: string) => boolean;
  createWithdrawalRequest: (
    amount: number,
    asset: string,
    walletAddress: string
  ) => void;
  updateBalance: (newBalance: number) => void;
  createDepositRequest: (
    amount: number,
    asset: string,
    transactionHash?: string
  ) => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(
  undefined
);

export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestment must be used within an InvestmentProvider");
  }
  return context;
}

interface InvestmentProviderProps {
  children: ReactNode;
}

export function InvestmentProvider({ children }: InvestmentProviderProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0); // Total balance (sum of all assets)
  const [assetBalances, setAssetBalances] = useState<AssetBalance>({
    BTC: 0,
    ETH: 0,
    SOL: 0,
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Get user-specific storage keys
  const getUserStorageKey = (key: string) => (user ? `${key}_${user.id}` : key);

  // Helper functions
  const getTotalInvested = (): number => {
    return investments
      .filter((inv) => inv.status === "active")
      .reduce((total, inv) => total + inv.amount, 0);
  };

  const getTotalEarnings = (): number => {
    return investments.reduce((total, inv) => total + inv.earned, 0);
  };

  const getActiveInvestments = (): Investment[] => {
    return investments.filter((inv) => inv.status === "active");
  };

  const getAvailableBalance = (): number => {
    // Available balance is the current balance (which already includes earnings)
    // No need to add earnings again since they're automatically added to balance
    return balance;
  };

  const getAssetBalance = (asset: string): number => {
    return assetBalances[asset as keyof AssetBalance] || 0;
  };

  const updateAssetBalance = (asset: string, amount: number) => {
    setAssetBalances((prev) => {
      const newBalances = { ...prev, [asset]: amount };
      // Update total balance as sum of all asset balances
      const newTotalBalance = Object.values(newBalances).reduce(
        (sum, bal) => sum + bal,
        0
      );
      setBalance(newTotalBalance);
      return newBalances;
    });
  };

  // Sync current user data to admin system
  const syncUserDataToAdmin = () => {
    if (!user) return;

    const adminUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
    const userIndex = adminUsers.findIndex((u: any) => u.id === user.id);

    const userData = {
      id: user.id,
      email: user.email,
      name: user.email.split("@")[0],
      balance,
      totalInvested: getTotalInvested(),
      totalEarnings: getTotalEarnings(),
      joinDate: new Date().toISOString().split("T")[0],
      isVerified: user.isVerified,
      status: "active" as const,
    };

    if (userIndex >= 0) {
      // Update existing user, preserving admin-set fields
      adminUsers[userIndex] = {
        ...adminUsers[userIndex],
        ...userData,
        // Preserve status if it was set by admin (suspended, etc.)
        status: adminUsers[userIndex].status || "active",
      };
    } else {
      // Add new user to admin system
      adminUsers.push(userData);
    }

    localStorage.setItem("adminUsers", JSON.stringify(adminUsers));

    // Also sync investments and transactions to admin system
    const allInvestments = JSON.parse(
      localStorage.getItem("adminInvestments") || "[]"
    );
    const allTransactions = JSON.parse(
      localStorage.getItem("adminTransactions") || "[]"
    );

    // Update user's investments in admin system
    const filteredInvestments = allInvestments.filter(
      (inv: any) => inv.userId !== user.id
    );
    const userInvestmentsForAdmin = investments.map((inv) => ({
      ...inv,
      userId: user.id,
      userEmail: user.email,
    }));
    localStorage.setItem(
      "adminInvestments",
      JSON.stringify([...filteredInvestments, ...userInvestmentsForAdmin])
    );

    // Update user's transactions in admin system
    const filteredTransactions = allTransactions.filter(
      (tx: any) => tx.userId !== user.id
    );
    const userTransactionsForAdmin = transactions.map((tx) => ({
      ...tx,
      userId: user.id,
      userEmail: user.email,
    }));
    localStorage.setItem(
      "adminTransactions",
      JSON.stringify([...filteredTransactions, ...userTransactionsForAdmin])
    );
  };

  // Load user-specific data from localStorage on mount and when user changes
  useEffect(() => {
    if (!user) return;

    const userBalanceKey = getUserStorageKey("userBalance");
    const userAssetBalancesKey = getUserStorageKey("userAssetBalances");
    const userInvestmentsKey = getUserStorageKey("userInvestments");
    const userTransactionsKey = getUserStorageKey("userTransactions");

    const storedBalance = localStorage.getItem(userBalanceKey);
    const storedAssetBalances = localStorage.getItem(userAssetBalancesKey);
    const storedInvestments = localStorage.getItem(userInvestmentsKey);
    const storedTransactions = localStorage.getItem(userTransactionsKey);

    if (storedBalance) {
      setBalance(parseFloat(storedBalance));
    } else {
      setBalance(0); // Default starting balance for new users
    }

    if (storedAssetBalances) {
      const parsedAssetBalances = JSON.parse(storedAssetBalances);
      setAssetBalances(parsedAssetBalances);
      // Recalculate total balance from asset balances
      const totalFromAssets = Object.values(parsedAssetBalances).reduce(
        (sum: number, bal: any) => sum + bal,
        0
      );
      setBalance(totalFromAssets);
    } else {
      setAssetBalances({ BTC: 0, ETH: 0, SOL: 0 });
    }

    if (storedInvestments) {
      setInvestments(JSON.parse(storedInvestments));
    } else {
      setInvestments([]);
    }

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      setTransactions([]);
    }

    // Sync user data with admin system
    syncUserDataToAdmin();
  }, [user]);

  // Listen for admin balance updates and external changes
  useEffect(() => {
    if (!user) return;

    const checkAdminBalanceUpdates = () => {
      const userBalanceKey = getUserStorageKey("userBalance");
      const userTransactionsKey = getUserStorageKey("userTransactions");
      const storedBalance = localStorage.getItem(userBalanceKey);
      const storedTransactions = localStorage.getItem(userTransactionsKey);

      // Check for direct balance updates from admin actions
      if (storedBalance) {
        const newBalance = parseFloat(storedBalance);
        if (newBalance !== balance) {
          setBalance(newBalance);
        }
      }

      // Check for transaction updates from admin actions
      if (storedTransactions) {
        const updatedTransactions = JSON.parse(storedTransactions);
        // Only update if the transactions have actually changed
        if (
          JSON.stringify(updatedTransactions) !== JSON.stringify(transactions)
        ) {
          setTransactions(updatedTransactions);
        }
      }

      // Also check admin users storage for balance updates
      const adminUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      const adminUser = adminUsers.find((u: any) => u.id === user.id);

      if (
        adminUser &&
        adminUser.balance !== undefined &&
        adminUser.balance !== balance
      ) {
        setBalance(adminUser.balance);
        // Update the user-specific storage to keep in sync
        localStorage.setItem(userBalanceKey, adminUser.balance.toString());
      }
    };

    // Check more frequently for balance updates (every 1 second)
    const interval = setInterval(checkAdminBalanceUpdates, 1000);
    return () => clearInterval(interval);
  }, [user, balance, transactions, getUserStorageKey]); // Save user-specific data to localStorage whenever state changes
  useEffect(() => {
    if (!user) return;
    const userBalanceKey = getUserStorageKey("userBalance");
    localStorage.setItem(userBalanceKey, balance.toString());

    // Also sync back to admin system
    syncUserDataToAdmin();
  }, [balance, user, getUserStorageKey]);

  useEffect(() => {
    if (!user) return;
    const userInvestmentsKey = getUserStorageKey("userInvestments");
    localStorage.setItem(userInvestmentsKey, JSON.stringify(investments));
    syncUserDataToAdmin();
  }, [investments, user, getUserStorageKey]);

  useEffect(() => {
    if (!user) return;
    const userAssetBalancesKey = getUserStorageKey("userAssetBalances");
    localStorage.setItem(userAssetBalancesKey, JSON.stringify(assetBalances));
  }, [assetBalances, user, getUserStorageKey]);

  useEffect(() => {
    if (!user) return;
    const userTransactionsKey = getUserStorageKey("userTransactions");
    localStorage.setItem(userTransactionsKey, JSON.stringify(transactions));
  }, [transactions, user, getUserStorageKey]);

  // Update investment progress, earnings, and reflect earnings in balance
  useEffect(() => {
    const updateInvestments = () => {
      setInvestments((currentInvestments) => {
        let totalEarningsChange = 0;
        const completedInvestmentIds: string[] = [];

        const updatedInvestments = currentInvestments.map((investment) => {
          if (investment.status !== "active") return investment;

          const now = new Date();
          const start = new Date(investment.startDate);
          const end = new Date(investment.endDate);

          const totalDays = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          const elapsedDays = Math.ceil(
            (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );

          const progress = Math.min((elapsedDays / totalDays) * 100, 100);
          const newEarned =
            ((investment.amount * (investment.apr / 100)) / 365) * elapsedDays;

          // Calculate the earnings difference for balance update
          const earningsChange = newEarned - investment.earned;
          totalEarningsChange += earningsChange;

          if (progress >= 100) {
            // Investment completed - track this for transaction status update
            completedInvestmentIds.push(investment.id);
            return {
              ...investment,
              progress: 100,
              earned: newEarned,
              status: "completed" as const,
            };
          }

          return {
            ...investment,
            progress,
            earned: newEarned,
          };
        });

        // Update transaction status for completed investments
        if (completedInvestmentIds.length > 0) {
          setTransactions((prevTransactions) =>
            prevTransactions.map((tx) => {
              // Find investment transactions that should be marked as completed
              if (tx.type === "Investment" && tx.status === "Active") {
                const correspondingInvestment = currentInvestments.find(
                  (inv) =>
                    inv.asset === tx.asset &&
                    inv.amount === tx.amount &&
                    completedInvestmentIds.includes(inv.id)
                );
                if (correspondingInvestment) {
                  return { ...tx, status: "Completed" as const };
                }
              }
              return tx;
            })
          );
        }

        // Update balance with new earnings (but don't subtract, just add the difference)
        if (totalEarningsChange > 0) {
          setBalance((prevBalance) => prevBalance + totalEarningsChange);
        }

        return updatedInvestments;
      });
    };

    // Update immediately
    updateInvestments();

    // Update every 30 seconds for more frequent balance updates
    const interval = setInterval(updateInvestments, 30000);
    return () => clearInterval(interval);
  }, []);

  const createInvestment = (
    investmentData: Omit<
      Investment,
      "id" | "startDate" | "endDate" | "earned" | "status" | "progress"
    >
  ): boolean => {
    const assetBalance = getAssetBalance(investmentData.asset);
    if (investmentData.amount > assetBalance) {
      return false; // Insufficient funds in this specific asset
    }

    const now = new Date();
    const endDate = new Date(
      now.getTime() + investmentData.period * 24 * 60 * 60 * 1000
    );

    const newInvestment: Investment = {
      ...investmentData,
      id: `inv_${Date.now()}`,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      earned: 0,
      status: "active",
      progress: 0,
    };

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      date: now.toISOString().split("T")[0],
      type: "Investment",
      asset: investmentData.asset,
      amount: investmentData.amount,
      status: "Active",
      description: `${investmentData.tier} investment in ${investmentData.asset}`,
    };

    setInvestments((prev) => [...prev, newInvestment]);
    setTransactions((prev) => [newTransaction, ...prev]);

    // Deduct from specific asset balance instead of general balance
    const newAssetBalance = assetBalance - investmentData.amount;
    updateAssetBalance(investmentData.asset, newAssetBalance);

    return true;
  };

  const withdraw = (amount: number, asset: string): boolean => {
    const availableBalance = getAvailableBalance();

    if (amount > availableBalance) {
      return false; // Insufficient funds
    }

    // This function is kept for backward compatibility but should not be used directly
    // Use createWithdrawalRequest instead
    return true;
  };

  const createWithdrawalRequest = (
    amount: number,
    asset: string,
    walletAddress: string
  ) => {
    if (!user) return;

    // Create withdrawal request for admin approval
    const withdrawalRequest = {
      id: `withdrawal_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      amount,
      asset,
      walletAddress,
      requestDate: new Date().toISOString(),
      status: "pending" as const,
    };

    // Add to admin withdrawal requests
    const currentRequests = JSON.parse(
      localStorage.getItem("adminWithdrawals") || "[]"
    );
    const updatedRequests = [withdrawalRequest, ...currentRequests];
    localStorage.setItem("adminWithdrawals", JSON.stringify(updatedRequests));

    // Add transaction record for user with pending status
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Withdrawal",
      asset,
      amount,
      status: "Pending",
      description: `Withdrawal request to ${asset} wallet`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  const createDepositRequest = (
    amount: number,
    asset: string,
    transactionHash?: string
  ) => {
    if (!user) return;

    // Create deposit request for admin approval
    const depositRequest = {
      id: `deposit_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      amount,
      asset,
      transactionHash,
      requestDate: new Date().toISOString(),
      status: "pending" as const,
    };

    // Add to admin deposit requests
    const currentDeposits = JSON.parse(
      localStorage.getItem("adminDeposits") || "[]"
    );
    const updatedDeposits = [depositRequest, ...currentDeposits];
    localStorage.setItem("adminDeposits", JSON.stringify(updatedDeposits));

    // Add transaction record for user
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Deposit",
      asset,
      amount,
      status: "Pending",
      description: `Deposit request for ${asset}`,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const value = {
    balance,
    assetBalances,
    investments,
    transactions,
    createInvestment,
    getTotalInvested,
    getTotalEarnings,
    getActiveInvestments,
    getAvailableBalance,
    getAssetBalance,
    updateAssetBalance,
    withdraw,
    createWithdrawalRequest,
    updateBalance,
    createDepositRequest,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}
