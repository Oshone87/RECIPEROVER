import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "../lib/apiClient";

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  totalInvested: number;
  totalEarnings: number;
  joinDate: string;
  hasCompletedKYC: boolean;
  status: "active" | "suspended" | "pending";
}

interface AdminContextType {
  users: User[];
  loading: boolean;
  getAllUsers: () => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUserKYC: (
    userId: string,
    status: "approved" | "rejected" | "pending"
  ) => Promise<boolean>;
  suspendUser: (userId: string, reason: string) => void;
  activateUser: (userId: string) => void;

  // Investments Management
  allInvestments: any[];
  getUserInvestments: (userId: string) => any[];
  cancelInvestment: (investmentId: string, reason: string) => void;
  completeInvestment: (investmentId: string) => void;

  // Transactions Management
  allTransactions: any[];
  updateTransactionStatus: (
    transactionId: string,
    status: string,
    adminNotes?: string
  ) => void;

  // Withdrawal Requests
  withdrawalRequests: any[];
  getPendingWithdrawals: () => any[];
  approveWithdrawal: (requestId: string, adminNotes?: string) => void;
  rejectWithdrawal: (requestId: string, reason: string) => void;
  completeWithdrawal: (requestId: string) => void;

  // Deposit Requests
  depositRequests: any[];
  getPendingDeposits: () => any[];
  verifyDeposit: (requestId: string, adminNotes?: string) => void;
  rejectDeposit: (requestId: string, reason: string) => void;

  // KYC Requests
  kycRequests: any[];
  getPendingKYC: () => any[];
  approveKYC: (requestId: string, adminNotes?: string) => void;
  rejectKYC: (requestId: string, reason: string) => void;

  // Admin Actions
  createManualInvestment: (userId: string, investmentData: any) => void;

  // Statistics
  getPlatformStats: () => any;
  getTotalPlatformValue: () => number;
  getTotalActiveInvestments: () => number;
  getTotalUsers: () => number;

  refreshData: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [allInvestments, setAllInvestments] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);

  const getAllUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId);
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await apiClient.deleteUser(userId);
      await getAllUsers();
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      return false;
    }
  };

  const updateUserKYC = async (
    userId: string,
    status: "approved" | "rejected" | "pending"
  ): Promise<boolean> => {
    try {
      await apiClient.updateUserKYC(userId, status);
      await getAllUsers();
      return true;
    } catch (error) {
      console.error("Failed to update user KYC:", error);
      return false;
    }
  };

  // Placeholder functions for compatibility
  const suspendUser = (userId: string, reason: string) => {
    console.log("Suspending user:", userId, reason);
  };

  const activateUser = (userId: string) => {
    console.log("Activating user:", userId);
  };

  const getUserInvestments = (userId: string) => {
    return allInvestments.filter((inv) => inv.userId === userId);
  };

  const cancelInvestment = (investmentId: string, reason: string) => {
    console.log("Cancelling investment:", investmentId, reason);
  };

  const completeInvestment = (investmentId: string) => {
    console.log("Completing investment:", investmentId);
  };

  const updateTransactionStatus = (
    transactionId: string,
    status: string,
    adminNotes?: string
  ) => {
    console.log(
      "Updating transaction status:",
      transactionId,
      status,
      adminNotes
    );
  };

  const getPendingWithdrawals = () =>
    withdrawalRequests.filter((req) => req.status === "pending");
  const getPendingDeposits = () =>
    depositRequests.filter((req) => req.status === "pending");
  const getPendingKYC = () =>
    kycRequests.filter((req) => req.status === "pending");

  const approveWithdrawal = (requestId: string, adminNotes?: string) => {
    console.log("Approving withdrawal:", requestId, adminNotes);
  };

  const rejectWithdrawal = (requestId: string, reason: string) => {
    console.log("Rejecting withdrawal:", requestId, reason);
  };

  const completeWithdrawal = (requestId: string) => {
    console.log("Completing withdrawal:", requestId);
  };

  const verifyDeposit = (requestId: string, adminNotes?: string) => {
    console.log("Verifying deposit:", requestId, adminNotes);
  };

  const rejectDeposit = (requestId: string, reason: string) => {
    console.log("Rejecting deposit:", requestId, reason);
  };

  const approveKYC = (requestId: string, adminNotes?: string) => {
    console.log("Approving KYC:", requestId, adminNotes);
  };

  const rejectKYC = (requestId: string, reason: string) => {
    console.log("Rejecting KYC:", requestId, reason);
  };

  const createManualInvestment = (userId: string, investmentData: any) => {
    console.log("Creating manual investment:", userId, investmentData);
  };

  const getPlatformStats = () => {
    return {
      totalUsers: users.length,
      totalInvestments: allInvestments.length,
      totalPlatformValue: 0,
      activeInvestments: allInvestments.filter((inv) => inv.status === "active")
        .length,
    };
  };

  const getTotalPlatformValue = () => 0;
  const getTotalActiveInvestments = () =>
    allInvestments.filter((inv) => inv.status === "active").length;
  const getTotalUsers = () => users.length;

  const refreshData = async () => {
    await getAllUsers();
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    users,
    loading,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUserKYC,
    suspendUser,
    activateUser,
    allInvestments,
    getUserInvestments,
    cancelInvestment,
    completeInvestment,
    allTransactions,
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
    kycRequests,
    getPendingKYC,
    approveKYC,
    rejectKYC,
    createManualInvestment,
    getPlatformStats,
    getTotalPlatformValue,
    getTotalActiveInvestments,
    getTotalUsers,
    refreshData,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
