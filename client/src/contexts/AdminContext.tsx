import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  totalInvested: number;
  totalEarnings: number;
  joinDate: string;
  isVerified: boolean;
  status: "active" | "suspended" | "pending";
}

interface Investment {
  id: string;
  userId: string;
  userEmail: string;
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
  userId: string;
  userEmail: string;
  date: string;
  type: "Investment" | "Deposit" | "Withdrawal" | "Earnings";
  asset: string;
  amount: number;
  status: "Completed" | "Pending" | "Processing" | "Rejected";
  description: string;
  adminNotes?: string;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  asset: string;
  walletAddress: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "completed";
  adminNotes?: string;
}

interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  asset: string;
  transactionHash?: string;
  requestDate: string;
  status: "pending" | "verified" | "rejected";
  adminNotes?: string;
}

interface AdminContextType {
  // Users Management
  users: User[];
  getAllUsers: () => User[];
  getUserById: (userId: string) => User | undefined;
  updateUserBalance: (userId: string, newBalance: number) => void;
  suspendUser: (userId: string, reason: string) => void;
  activateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Investments Management
  allInvestments: Investment[];
  getUserInvestments: (userId: string) => Investment[];
  updateInvestmentAmount: (investmentId: string, newAmount: number) => void;
  updateInvestmentEarnings: (investmentId: string, newEarnings: number) => void;
  updateInvestmentCurrentValue: (
    investmentId: string,
    newCurrentValue: number
  ) => void;
  cancelInvestment: (investmentId: string, reason: string) => void;
  completeInvestment: (investmentId: string) => void;

  // Transactions Management
  allTransactions: Transaction[];
  getUserTransactions: (userId: string) => Transaction[];
  updateTransactionStatus: (
    transactionId: string,
    status: Transaction["status"],
    adminNotes?: string
  ) => void;

  // Withdrawal Requests
  withdrawalRequests: WithdrawalRequest[];
  getPendingWithdrawals: () => WithdrawalRequest[];
  approveWithdrawal: (requestId: string, adminNotes?: string) => void;
  rejectWithdrawal: (requestId: string, reason: string) => void;
  completeWithdrawal: (requestId: string) => void;

  // Deposit Requests
  depositRequests: DepositRequest[];
  getPendingDeposits: () => DepositRequest[];
  verifyDeposit: (requestId: string, adminNotes?: string) => void;
  rejectDeposit: (requestId: string, reason: string) => void;

  // Admin Actions
  addFundsToUser: (userId: string, amount: number, reason: string) => void;
  deductFundsFromUser: (userId: string, amount: number, reason: string) => void;
  createManualInvestment: (
    userId: string,
    investmentData: Omit<
      Investment,
      | "id"
      | "userId"
      | "userEmail"
      | "startDate"
      | "endDate"
      | "earned"
      | "status"
      | "progress"
    >
  ) => void;

  // Statistics
  getTotalPlatformValue: () => number;
  getTotalActiveInvestments: () => number;
  getTotalUsers: () => number;
  getPlatformStats: () => {
    totalUsers: number;
    activeUsers: number;
    totalInvestments: number;
    totalPlatformValue: number;
    pendingWithdrawals: number;
    pendingDeposits: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);

  // Sync users from auth system to admin system
  const syncUsersFromAuth = () => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const currentAdminUsers = JSON.parse(
      localStorage.getItem("adminUsers") || "[]"
    );

    const adminUsers: User[] = registeredUsers
      .filter((authUser: any) => authUser.email !== "admin@reciperover.com") // Exclude admin from user list
      .map((authUser: any) => {
        // Check if user already exists in admin system
        const existingUser = currentAdminUsers.find(
          (u: any) => u.id === authUser.id
        );

        if (existingUser) {
          // Preserve existing user data but update auth-related fields
          return {
            ...existingUser,
            email: authUser.email,
            isVerified: authUser.isVerified || false,
          };
        } else {
          // Create new user with default values
          return {
            id: authUser.id,
            email: authUser.email,
            name: authUser.email.split("@")[0],
            balance: 0,
            totalInvested: 0,
            totalEarnings: 0,
            joinDate: new Date().toISOString().split("T")[0],
            isVerified: authUser.isVerified || false,
            status: "active" as const,
          };
        }
      });

    // Update users state and save to localStorage
    setUsers(adminUsers);
    localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
  };

  // Load admin data from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("adminUsers");
    const storedInvestments = localStorage.getItem("adminInvestments");
    const storedTransactions = localStorage.getItem("adminTransactions");
    const storedWithdrawals = localStorage.getItem("adminWithdrawals");
    const storedDeposits = localStorage.getItem("adminDeposits");

    // Always sync with registered users to ensure consistency
    syncUsersFromAuth();

    if (storedInvestments) {
      setAllInvestments(JSON.parse(storedInvestments));
    }
    if (storedTransactions) {
      setAllTransactions(JSON.parse(storedTransactions));
    }
    if (storedWithdrawals) {
      setWithdrawalRequests(JSON.parse(storedWithdrawals));
    }
    // Start with empty withdrawal requests

    if (storedDeposits) {
      setDepositRequests(JSON.parse(storedDeposits));
    }
    // Start with empty deposit requests

    // Set up periodic sync every 10 seconds to keep data consistent
    const syncInterval = setInterval(syncUsersFromAuth, 10000);

    return () => clearInterval(syncInterval);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("adminUsers", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("adminInvestments", JSON.stringify(allInvestments));
  }, [allInvestments]);

  useEffect(() => {
    localStorage.setItem("adminTransactions", JSON.stringify(allTransactions));
  }, [allTransactions]);

  useEffect(() => {
    localStorage.setItem(
      "adminWithdrawals",
      JSON.stringify(withdrawalRequests)
    );
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem("adminDeposits", JSON.stringify(depositRequests));
  }, [depositRequests]);

  // User Management Functions
  const getAllUsers = () => users;

  const getUserById = (userId: string) =>
    users.find((user) => user.id === userId);

  const updateUserBalance = (userId: string, newBalance: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, balance: newBalance } : user
      )
    );
  };

  const suspendUser = (userId: string, reason: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "suspended" as const } : user
      )
    );

    // Add admin transaction log
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      userId,
      userEmail: users.find((u) => u.id === userId)?.email || "",
      date: new Date().toISOString(),
      type: "Earnings",
      asset: "USD",
      amount: 0,
      status: "Completed",
      description: "Account suspended",
      adminNotes: reason,
    };
    setAllTransactions((prev) => [newTransaction, ...prev]);
  };

  const activateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "active" as const } : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    // Remove user from admin system
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setAllInvestments((prev) => prev.filter((inv) => inv.userId !== userId));
    setAllTransactions((prev) => prev.filter((tx) => tx.userId !== userId));
    setWithdrawalRequests((prev) =>
      prev.filter((req) => req.userId !== userId)
    );
    setDepositRequests((prev) => prev.filter((req) => req.userId !== userId));

    // Also remove user from auth system
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const updatedRegisteredUsers = registeredUsers.filter(
      (user: any) => user.id !== userId
    );
    localStorage.setItem(
      "registeredUsers",
      JSON.stringify(updatedRegisteredUsers)
    );

    // Remove user's individual data
    localStorage.removeItem(`userBalance_${userId}`);
    localStorage.removeItem(`userInvestments_${userId}`);
    localStorage.removeItem(`userTransactions_${userId}`);
  };

  // Investment Management Functions
  const getUserInvestments = (userId: string) =>
    allInvestments.filter((inv) => inv.userId === userId);

  const updateInvestmentAmount = (investmentId: string, newAmount: number) => {
    setAllInvestments((prev) =>
      prev.map((inv) =>
        inv.id === investmentId ? { ...inv, amount: newAmount } : inv
      )
    );
  };

  const updateInvestmentEarnings = (
    investmentId: string,
    newEarnings: number
  ) => {
    setAllInvestments((prev) =>
      prev.map((inv) =>
        inv.id === investmentId ? { ...inv, earned: newEarnings } : inv
      )
    );
  };

  const updateInvestmentCurrentValue = (
    investmentId: string,
    newCurrentValue: number
  ) => {
    const investment = allInvestments.find((inv) => inv.id === investmentId);
    if (investment) {
      const newEarnings = Math.max(0, newCurrentValue - investment.amount);
      setAllInvestments((prev) =>
        prev.map((inv) =>
          inv.id === investmentId ? { ...inv, earned: newEarnings } : inv
        )
      );
    }
  };

  const cancelInvestment = (investmentId: string, reason: string) => {
    setAllInvestments((prev) =>
      prev.map((inv) =>
        inv.id === investmentId ? { ...inv, status: "cancelled" as const } : inv
      )
    );
  };

  const completeInvestment = (investmentId: string) => {
    setAllInvestments((prev) =>
      prev.map((inv) =>
        inv.id === investmentId
          ? { ...inv, status: "completed" as const, progress: 100 }
          : inv
      )
    );
  };

  // Transaction Management Functions
  const getUserTransactions = (userId: string) =>
    allTransactions.filter((tx) => tx.userId === userId);

  const updateTransactionStatus = (
    transactionId: string,
    status: Transaction["status"],
    adminNotes?: string
  ) => {
    setAllTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId ? { ...tx, status, adminNotes } : tx
      )
    );
  };

  // Withdrawal Management Functions
  const getPendingWithdrawals = () =>
    withdrawalRequests.filter((req) => req.status === "pending");

  const approveWithdrawal = (requestId: string, adminNotes?: string) => {
    const withdrawal = withdrawalRequests.find((req) => req.id === requestId);
    if (withdrawal) {
      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "approved" as const, adminNotes }
            : req
        )
      );

      // Deduct funds from user balance in admin system
      const currentUser = getUserById(withdrawal.userId);
      if (currentUser) {
        updateUserBalance(
          withdrawal.userId,
          currentUser.balance - withdrawal.amount
        );

        // Also update the user's individual balance in InvestmentContext storage
        const userBalanceKey = `userBalance_${withdrawal.userId}`;
        const currentUserBalance = parseFloat(
          localStorage.getItem(userBalanceKey) || "0"
        );
        const newUserBalance = currentUserBalance - withdrawal.amount;
        localStorage.setItem(userBalanceKey, newUserBalance.toString());

        // Update the user's transaction status to Approved
        const userTransactionsKey = `userTransactions_${withdrawal.userId}`;
        const userTransactions = JSON.parse(
          localStorage.getItem(userTransactionsKey) || "[]"
        );
        const updatedTransactions = userTransactions.map((tx: any) => {
          if (
            tx.type === "Withdrawal" &&
            tx.amount === withdrawal.amount &&
            tx.status === "Pending"
          ) {
            return {
              ...tx,
              status: "Approved",
              description: `Withdrawal approved by admin`,
            };
          }
          return tx;
        });
        localStorage.setItem(
          userTransactionsKey,
          JSON.stringify(updatedTransactions)
        );
      }
    }
  };

  const rejectWithdrawal = (requestId: string, reason: string) => {
    const withdrawal = withdrawalRequests.find((req) => req.id === requestId);
    if (withdrawal) {
      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "rejected" as const, adminNotes: reason }
            : req
        )
      );

      // Update the user's transaction status to Failed
      const userTransactionsKey = `userTransactions_${withdrawal.userId}`;
      const userTransactions = JSON.parse(
        localStorage.getItem(userTransactionsKey) || "[]"
      );
      const updatedTransactions = userTransactions.map((tx: any) => {
        if (
          tx.type === "Withdrawal" &&
          tx.amount === withdrawal.amount &&
          tx.status === "Pending"
        ) {
          return {
            ...tx,
            status: "Failed",
            description: `Withdrawal rejected: ${reason}`,
          };
        }
        return tx;
      });
      localStorage.setItem(
        userTransactionsKey,
        JSON.stringify(updatedTransactions)
      );
    }
  };

  const completeWithdrawal = (requestId: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "completed" as const } : req
      )
    );
  };

  // Deposit Management Functions
  const getPendingDeposits = () =>
    depositRequests.filter((req) => req.status === "pending");

  const verifyDeposit = (requestId: string, adminNotes?: string) => {
    const deposit = depositRequests.find((req) => req.id === requestId);
    if (deposit) {
      setDepositRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "verified" as const, adminNotes }
            : req
        )
      );

      // Add funds to user balance in admin system
      updateUserBalance(
        deposit.userId,
        (getUserById(deposit.userId)?.balance || 0) + deposit.amount
      );

      // Also update the user's individual balance in InvestmentContext storage
      const userBalanceKey = `userBalance_${deposit.userId}`;
      const currentUserBalance = parseFloat(
        localStorage.getItem(userBalanceKey) || "0"
      );
      const newUserBalance = currentUserBalance + deposit.amount;
      localStorage.setItem(userBalanceKey, newUserBalance.toString());

      // Update the user's existing pending transaction status to Approved
      const userTransactionsKey = `userTransactions_${deposit.userId}`;
      const userTransactions = JSON.parse(
        localStorage.getItem(userTransactionsKey) || "[]"
      );
      const updatedTransactions = userTransactions.map((tx: any) => {
        if (
          tx.type === "Deposit" &&
          tx.amount === deposit.amount &&
          tx.status === "Pending"
        ) {
          return {
            ...tx,
            status: "Approved",
            description: `Deposit approved by admin`,
          };
        }
        return tx;
      });
      localStorage.setItem(
        userTransactionsKey,
        JSON.stringify(updatedTransactions)
      );
    }
  };

  const rejectDeposit = (requestId: string, reason: string) => {
    const deposit = depositRequests.find((req) => req.id === requestId);
    if (deposit) {
      setDepositRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "rejected" as const, adminNotes: reason }
            : req
        )
      );

      // Update the user's transaction status to Failed
      const userTransactionsKey = `userTransactions_${deposit.userId}`;
      const userTransactions = JSON.parse(
        localStorage.getItem(userTransactionsKey) || "[]"
      );
      const updatedTransactions = userTransactions.map((tx: any) => {
        if (
          tx.type === "Deposit" &&
          tx.amount === deposit.amount &&
          tx.status === "Pending"
        ) {
          return {
            ...tx,
            status: "Failed",
            description: `Deposit rejected: ${reason}`,
          };
        }
        return tx;
      });
      localStorage.setItem(
        userTransactionsKey,
        JSON.stringify(updatedTransactions)
      );
    }
  };

  // Admin Actions
  const addFundsToUser = (userId: string, amount: number, reason: string) => {
    const user = getUserById(userId);
    if (user) {
      updateUserBalance(userId, user.balance + amount);

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        userId,
        userEmail: user.email,
        date: new Date().toISOString(),
        type: "Deposit",
        asset: "USD",
        amount,
        status: "Completed",
        description: "Admin deposit",
        adminNotes: reason,
      };
      setAllTransactions((prev) => [newTransaction, ...prev]);
    }
  };

  const deductFundsFromUser = (
    userId: string,
    amount: number,
    reason: string
  ) => {
    const user = getUserById(userId);
    if (user) {
      updateUserBalance(userId, Math.max(0, user.balance - amount));

      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        userId,
        userEmail: user.email,
        date: new Date().toISOString(),
        type: "Withdrawal",
        asset: "USD",
        amount,
        status: "Completed",
        description: "Admin deduction",
        adminNotes: reason,
      };
      setAllTransactions((prev) => [newTransaction, ...prev]);
    }
  };

  const createManualInvestment = (
    userId: string,
    investmentData: Omit<
      Investment,
      | "id"
      | "userId"
      | "userEmail"
      | "startDate"
      | "endDate"
      | "earned"
      | "status"
      | "progress"
    >
  ) => {
    const user = getUserById(userId);
    if (user) {
      const now = new Date();
      const endDate = new Date(
        now.getTime() + investmentData.period * 24 * 60 * 60 * 1000
      );

      const newInvestment: Investment = {
        ...investmentData,
        id: `inv_${Date.now()}`,
        userId,
        userEmail: user.email,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        earned: 0,
        status: "active",
        progress: 0,
      };

      setAllInvestments((prev) => [...prev, newInvestment]);
    }
  };

  // Statistics Functions
  const getTotalPlatformValue = () => {
    return users.reduce(
      (total, user) => total + user.balance + user.totalInvested,
      0
    );
  };

  const getTotalActiveInvestments = () => {
    return allInvestments.filter((inv) => inv.status === "active").length;
  };

  const getTotalUsers = () => users.length;

  const getPlatformStats = () => ({
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    totalInvestments: allInvestments.filter((inv) => inv.status === "active")
      .length,
    totalPlatformValue: getTotalPlatformValue(),
    pendingWithdrawals: getPendingWithdrawals().length,
    pendingDeposits: getPendingDeposits().length,
  });

  const value = {
    users,
    getAllUsers,
    getUserById,
    updateUserBalance,
    suspendUser,
    activateUser,
    deleteUser,
    allInvestments,
    getUserInvestments,
    updateInvestmentAmount,
    updateInvestmentEarnings,
    updateInvestmentCurrentValue,
    cancelInvestment,
    completeInvestment,
    allTransactions,
    getUserTransactions,
    updateTransactionStatus,
    withdrawalRequests,
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    completeWithdrawal,
    depositRequests,
    getPendingDeposits,
    verifyDeposit,
    rejectDeposit,
    addFundsToUser,
    deductFundsFromUser,
    createManualInvestment,
    getTotalPlatformValue,
    getTotalActiveInvestments,
    getTotalUsers,
    getPlatformStats,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
