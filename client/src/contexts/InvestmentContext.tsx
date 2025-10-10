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
  BTC: number;
  ETH: number;
  SOL: number;
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
    BTC: 0,
    ETH: 0,
    SOL: 0,
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
    // Available wallet balance only reflects liquid funds (not invested principal)
    return Object.values(assetBalances).reduce((sum, v) => sum + v, 0);
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
    const token = localStorage.getItem("authToken");
    if (!token) return; // Avoid calling APIs without a token (pre-login)

    try {
      setLoading(true);

      // Fetch balances and investments in parallel
      const [balancesResponse, investmentsResponse] = await Promise.all([
        apiClient.getBalances(),
        apiClient.getInvestments(),
      ]);

      // Update balances (available wallet funds)
      let mappedBalances: AssetBalance = { BTC: 0, ETH: 0, SOL: 0 };
      if (balancesResponse.balances) {
        const backendBalances = balancesResponse.balances;

        // Map backend keys to frontend keys
        mappedBalances = {
          BTC: backendBalances.bitcoin || 0,
          ETH: backendBalances.ethereum || 0,
          SOL: backendBalances.solana || 0,
        };

        setAssetBalances(mappedBalances);
      }

      // Update investments - map backend minimal investment into UI model
      let mappedInvs: Investment[] = [];
      if (investmentsResponse.investments) {
        mappedInvs = investmentsResponse.investments.map((inv: any) => {
          const startDate = inv.createdAt
            ? new Date(inv.createdAt)
            : new Date();
          const endDate = inv.period
            ? new Date(startDate.getTime() + inv.period * 24 * 60 * 60 * 1000)
            : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          const now = new Date();
          const totalDays = Math.max(
            1,
            Math.round(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          const elapsedDays = Math.min(
            totalDays,
            Math.max(
              0,
              Math.round(
                (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            )
          );
          const progress = Math.min(100, (elapsedDays / totalDays) * 100);

          // If backend doesn't store apr %, approximate from tier label if available, else default 24
          const aprFromTier = (tier: string) => {
            const t = (tier || "").toLowerCase();
            if (t.includes("platinum")) return 36;
            if (t.includes("gold")) return 30;
            if (t.includes("silver")) return 24;
            return 24;
          };
          const apr = Number(inv.apr || aprFromTier(inv.tier));

          // Naive earnings estimate (APR linear over period)
          const dailyRate = apr / 365 / 100;
          const earned = Number((inv.amount || 0) * dailyRate * elapsedDays);

          return {
            id: inv._id,
            tier: inv.tier,
            asset: inv.asset,
            amount: inv.amount,
            apr,
            period: inv.period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            earned,
            status: inv.status,
            progress,
          } as Investment;
        });
        setInvestments(mappedInvs);
      }

      // Generate transactions from investments (deposits/withdrawals from /balances/transactions)
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

      // Merge in backend transactions for deposits/withdrawals
      try {
        const txResp = await apiClient.getTransactions();
        const backendTx: Transaction[] = Array.isArray(txResp?.transactions)
          ? txResp.transactions.map((t: any) => ({
              id: t.id,
              date: t.date,
              type:
                (t.type || "").toLowerCase() === "deposit"
                  ? "Deposit"
                  : (t.type || "").toLowerCase() === "withdrawal"
                  ? "Withdrawal"
                  : "Investment",
              asset: t.asset,
              amount: Number(t.amount || 0),
              status:
                (t.status || "").toLowerCase() === "completed"
                  ? "Completed"
                  : (t.status || "").toLowerCase() === "pending"
                  ? "Pending"
                  : "Failed",
              description:
                (t.type || "").toLowerCase() === "deposit"
                  ? `Deposit ${t.asset}`
                  : (t.type || "").toLowerCase() === "withdrawal"
                  ? `Withdrawal ${t.asset}`
                  : `Investment ${t.asset}`,
            }))
          : [];
        allTransactions.push(...backendTx);
      } catch (e) {
        // ignore
      }

      setTransactions(
        allTransactions
          .filter(
            (x) => x && x.date && !Number.isNaN(new Date(x.date).getTime())
          )
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
      );

      // Compute displayed total balance = available wallet + invested principal + accrued earnings
      const available = Object.values(mappedBalances).reduce(
        (sum, v) => sum + v,
        0
      );
      const activePrincipal = mappedInvs
        .filter((i) => i.status === "active")
        .reduce((sum, i) => sum + i.amount, 0);
      const accrued = mappedInvs.reduce((sum, i) => sum + i.earned, 0);
      setBalance(available + activePrincipal + accrued);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes or component mounts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isAuthenticated && token) {
      refreshData();
    } else {
      // Clear data when user logs out
      setBalance(0);
      setAssetBalances({ BTC: 0, ETH: 0, SOL: 0 });
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
        mapAssetToBackend(investmentData.asset),
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
      await apiClient.deposit(mapAssetToBackend(asset), amount);

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
      await apiClient.withdraw(mapAssetToBackend(asset), amount);

      // Refresh data to get updated balances
      await refreshData();
      return true;
    } catch (error) {
      console.error("Failed to withdraw:", error);
      return false;
    }
  };

  // Helper function to map frontend asset names to backend asset names
  const mapAssetToBackend = (asset: string): string => {
    const assetMap: { [key: string]: string } = {
      BTC: "bitcoin",
      ETH: "ethereum",
      SOL: "solana",
    };
    return assetMap[asset] || asset.toLowerCase();
  };

  // Placeholder functions for compatibility
  const createDepositRequest = async (
    amount: number,
    asset: string,
    transactionHash?: string
  ) => {
    try {
      // Submit deposit request to backend
      await apiClient.submitDeposit({
        amount,
        asset: mapAssetToBackend(asset),
        transactionHash,
      });

      console.log("Deposit request created:", {
        amount,
        asset,
        transactionHash,
      });

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
    } catch (error) {
      console.error("Failed to create deposit request:", error);
      throw error;
    }
  };

  const createWithdrawalRequest = async (
    amount: number,
    asset: string,
    walletAddress: string
  ) => {
    try {
      // Submit withdrawal request to backend
      await apiClient.submitWithdrawal({
        amount,
        asset: mapAssetToBackend(asset),
        walletAddress,
      });

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
    } catch (error) {
      console.error("Failed to create withdrawal request:", error);
      throw error;
    }
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
