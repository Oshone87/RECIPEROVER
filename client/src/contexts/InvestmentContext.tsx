import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../lib/apiClient";

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
  USDT: number;
  BTC: number;
  ETH: number;
  BNB: number;
}

interface InvestmentContextType {
  balance: number;
  assetBalances: AssetBalance;
  investments: Investment[];
  transactions: Transaction[];
  loading: boolean;
  createInvestment: (
    investment: Omit<
      Investment,
      "id" | "startDate" | "endDate" | "earned" | "status" | "progress"
    >
  ) => Promise<boolean>;
  getTotalInvested: () => number;
  getTotalEarnings: () => number;
  getActiveInvestments: () => Investment[];
  getAvailableBalance: () => number;
  getAssetBalance: (asset: string) => number;
  updateAssetBalance: (asset: string, amount: number) => void;
  deposit: (amount: number, asset: string) => Promise<boolean>;
  withdraw: (amount: number, asset: string) => Promise<boolean>;
  createDepositRequest: (
    amount: number,
    asset: string,
    transactionHash?: string
  ) => void;
  createWithdrawalRequest: (
    amount: number,
    asset: string,
    walletAddress: string
  ) => void;
  refreshData: () => Promise<void>;
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

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [assetBalances, setAssetBalances] = useState<AssetBalance>({
    USDT: 0,
    BTC: 0,
    ETH: 0,
    BNB: 0,
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

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
    return balance;
  };

  const getAssetBalance = (asset: string): number => {
    return assetBalances[asset as keyof AssetBalance] || 0;
  };

  const updateAssetBalance = (asset: string, amount: number) => {
    setAssetBalances((prev) => {
      const newBalances = { ...prev, [asset]: amount };
      const newTotalBalance = Object.values(newBalances).reduce(
        (sum, bal) => sum + bal,
        0
      );
      setBalance(newTotalBalance);
      return newBalances;
    });
  };

  // Load data from backend when user is authenticated
  const refreshData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);

      // Fetch balances and investments in parallel
      const [balancesResponse, investmentsResponse] = await Promise.all([
        apiClient.getBalances(),
        apiClient.getInvestments(),
      ]);

      // Update balances
      if (balancesResponse.balances) {
        const balances = balancesResponse.balances.reduce(
          (acc: any, balance: any) => {
            acc[balance.asset] = balance.amount;
            return acc;
          },
          {}
        );

        setAssetBalances(balances);

        // Calculate total balance
        const totalBalance = Object.values(balances).reduce(
          (sum: number, amount: any) => sum + amount,
          0
        );
        setBalance(totalBalance);
      }

      // Update investments
      if (investmentsResponse.investments) {
        setInvestments(investmentsResponse.investments);
      }

      // Generate transactions from investments and balance operations
      const allTransactions: Transaction[] = [];

      // Add investment transactions
      investmentsResponse.investments?.forEach((inv: any) => {
        allTransactions.push({
          id: `inv_${inv._id}`,
          date: new Date(inv.createdAt).toISOString().split("T")[0],
          type: "Investment",
          asset: inv.asset,
          amount: inv.amount,
          status: inv.status === "active" ? "Active" : "Completed",
          description: `${inv.tier} investment in ${inv.asset}`,
        });
      });

      setTransactions(
        allTransactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes or component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      // Clear data when user logs out
      setBalance(0);
      setAssetBalances({ USDT: 0, BTC: 0, ETH: 0, BNB: 0 });
      setInvestments([]);
      setTransactions([]);
    }
  }, [isAuthenticated]);

  const createInvestment = async (
    investmentData: Omit<
      Investment,
      "id" | "startDate" | "endDate" | "earned" | "status" | "progress"
    >
  ): Promise<boolean> => {
    try {
      await apiClient.createInvestment(
        investmentData.tier,
        investmentData.amount,
        investmentData.asset,
        investmentData.period
      );

      // Refresh data to get updated balances and investments
      await refreshData();
      return true;
    } catch (error) {
      console.error("Failed to create investment:", error);
      return false;
    }
  };

  const deposit = async (amount: number, asset: string): Promise<boolean> => {
    try {
      await apiClient.deposit(asset, amount);

      // Refresh data to get updated balances
      await refreshData();
      return true;
    } catch (error) {
      console.error("Failed to deposit:", error);
      return false;
    }
  };

  const withdraw = async (amount: number, asset: string): Promise<boolean> => {
    try {
      await apiClient.withdraw(asset, amount);

      // Refresh data to get updated balances
      await refreshData();
      return true;
    } catch (error) {
      console.error("Failed to withdraw:", error);
      return false;
    }
  };

  // Placeholder functions for compatibility
  const createDepositRequest = (
    amount: number,
    asset: string,
    transactionHash?: string
  ) => {
    console.log("Deposit request created:", { amount, asset, transactionHash });
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

  const createWithdrawalRequest = (
    amount: number,
    asset: string,
    walletAddress: string
  ) => {
    console.log("Withdrawal request created:", {
      amount,
      asset,
      walletAddress,
    });
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

  const value = {
    balance,
    assetBalances,
    investments,
    transactions,
    loading,
    createInvestment,
    getTotalInvested,
    getTotalEarnings,
    getActiveInvestments,
    getAvailableBalance,
    getAssetBalance,
    updateAssetBalance,
    deposit,
    withdraw,
    createDepositRequest,
    createWithdrawalRequest,
    refreshData,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}
