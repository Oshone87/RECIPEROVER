import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { DailyProgressTracker } from "@/components/DailyProgressTracker";

// Types
interface DatabaseUser {
  _id: string;
  email: string;
  isVerified: boolean;
  isDisabled?: boolean;
  kycStatus: string;
  withdrawalRestricted?: boolean;
  restrictionReason?: string;
  restrictionTitle?: string;
  restrictionHeading?: string;
  restrictionMessage?: string;
  restrictedAt?: string;
  createdAt: string;
}

interface KYCRequest {
  _id: string;
  userId:
    | {
        email: string;
      }
    | string;
  firstName: string;
  lastName: string;
  status: string;
  submissionDate: string;
}

interface DepositRequest {
  _id: string;
  userId:
    | {
        email: string;
      }
    | string;
  amount: number;
  asset: string;
  status: string;
  submissionDate: string;
  transactionHash?: string;
}

interface WithdrawalRequest {
  _id: string;
  userId:
    | {
        email: string;
      }
    | string;
  amount: number;
  asset: string;
  walletAddress: string;
  status: string;
  submissionDate: string;
}

interface ProcessingFeePayment {
  _id: string;
  userId:
    | {
        email: string;
      }
    | string;
  amount: number;
  asset: string;
  status: string;
  submittedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export default function AdminDashboard() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
  const [processingFeePayments, setProcessingFeePayments] = useState<
    ProcessingFeePayment[]
  >([]);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [allInvestments, setAllInvestments] = useState<any[]>([]);
  const [invStatusFilter, setInvStatusFilter] = useState<
    "active" | "completed" | "cancelled" | "all"
  >("active");
  const [invEmailSearch, setInvEmailSearch] = useState("");
  const [invAssetFilter, setInvAssetFilter] = useState<
    "all" | "BTC" | "ETH" | "SOL"
  >("all");
  const [invTierFilter, setInvTierFilter] = useState<
    "all" | "Silver" | "Gold" | "Platinum"
  >("all");
  const [invPage, setInvPage] = useState(1);
  const invPageSize = 10;
  const [invDetailOpen, setInvDetailOpen] = useState(false);
  const [invDetail, setInvDetail] = useState<any | null>(null);
  // Users tab state
  const [usersFilter, setUsersFilter] = useState<"all" | "verified">("all");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const pageSize = 10;
  const filteredUsersAll = (users || [])
    .filter((u) => (usersFilter === "verified" ? u.isVerified === true : true))
    .filter((u) =>
      userSearch
        ? u.email.toLowerCase().includes(userSearch.toLowerCase())
        : true
    );
  const totalUserPages = Math.max(
    1,
    Math.ceil(filteredUsersAll.length / pageSize)
  );
  const pagedUsers = filteredUsersAll.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize
  );
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPlatformValue: 0,
    totalInvestments: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0,
    pendingKyc: 0,
  });
  const [loading, setLoading] = useState(true);
  const [kycViewOpen, setKycViewOpen] = useState(false);
  const [kycViewLoading, setKycViewLoading] = useState(false);
  const [kycDetail, setKycDetail] = useState<any | null>(null);

  // Restriction dialog state
  const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);
  const [restrictingUser, setRestrictingUser] = useState<DatabaseUser | null>(null);
  const [restrictionTitle, setRestrictionTitle] = useState("");
  const [restrictionHeading, setRestrictionHeading] = useState("");
  const [restrictionMessage, setRestrictionMessage] = useState("");

  // Check admin access and fetch data
  useEffect(() => {
    // Don't make API calls if still loading authentication state
    if (authLoading) return;

    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    // Check if user is admin
    if (user?.email !== "davidanyia72@gmail.com") {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }

    // Only fetch data if user is authenticated and is admin
    if (isAuthenticated && user?.email === "davidanyia72@gmail.com") {
      fetchAdminData();
    }
  }, [isAuthenticated, user, authLoading, setLocation, toast]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [
        usersResponse,
        statsResponse,
        kycResponse,
        depositsResponse,
        withdrawalsResponse,
        processingFeesResponse,
        activeInvResponse,
        allInvResponse,
      ] = await Promise.all([
        apiClient.getAllUsers(),
        apiClient.getPlatformStats(),
        apiClient.getKYCRequests(),
        apiClient.getDepositRequests(),
        apiClient.getWithdrawalRequests(),
        apiClient.getProcessingFeePayments(),
        apiClient.getAllInvestments(),
        apiClient.getAllInvestmentsAll(),
      ]);

      setUsers(usersResponse.users || []);
      setStats(
        statsResponse.stats || {
          totalUsers: 0,
          activeUsers: 0,
          totalPlatformValue: 0,
          totalInvestments: 0,
          pendingWithdrawals: 0,
          pendingDeposits: 0,
          pendingKyc: 0,
        }
      );
      setKycRequests(kycResponse.requests || []);
      setDepositRequests(depositsResponse.requests || []);
      setWithdrawalRequests(withdrawalsResponse.requests || []);
      setProcessingFeePayments(processingFeesResponse.payments || []);
      setActiveInvestments(activeInvResponse.investments || []);
      setAllInvestments(allInvResponse.investments || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // KYC Handlers
  const handleApproveKYC = async (requestId: string) => {
    try {
      await apiClient.updateKYCRequest(requestId, "approved");
      toast({
        title: "KYC Approved",
        description: "KYC request has been approved successfully",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve KYC request",
        variant: "destructive",
      });
    }
  };

  const handleViewKYC = async (requestId: string) => {
    try {
      setKycViewLoading(true);
      setKycDetail(null);
      setKycViewOpen(true);
      const data = await apiClient.getKYCRequestById(requestId);
      setKycDetail(data.request || data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load KYC details",
        variant: "destructive",
      });
      setKycViewOpen(false);
    } finally {
      setKycViewLoading(false);
    }
  };

  const handleRejectKYC = async (requestId: string) => {
    try {
      await apiClient.updateKYCRequest(
        requestId,
        "rejected",
        "Admin review failed"
      );
      toast({
        title: "KYC Rejected",
        description: "KYC request has been rejected",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject KYC request",
        variant: "destructive",
      });
    }
  };

  // Deposit Handlers
  const handleVerifyDeposit = async (requestId: string) => {
    try {
      await apiClient.updateDepositRequest(requestId, "verified");
      toast({
        title: "Deposit Verified",
        description: "Deposit has been verified successfully",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify deposit",
        variant: "destructive",
      });
    }
  };

  const handleRejectDeposit = async (requestId: string) => {
    try {
      await apiClient.updateDepositRequest(
        requestId,
        "rejected",
        "Invalid transaction"
      );
      toast({
        title: "Deposit Rejected",
        description: "Deposit has been rejected",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject deposit",
        variant: "destructive",
      });
    }
  };

  // Withdrawal Handlers
  const handleApproveWithdrawal = async (requestId: string) => {
    try {
      await apiClient.updateWithdrawalRequest(requestId, "approved");
      toast({
        title: "Withdrawal Approved",
        description: "Withdrawal has been approved successfully",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve withdrawal",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
    try {
      await apiClient.updateWithdrawalRequest(
        requestId,
        "rejected",
        "Insufficient verification"
      );
      toast({
        title: "Withdrawal Rejected",
        description: "Withdrawal has been rejected",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive",
      });
    }
  };

  // Processing Fee Handlers
  const handleVerifyProcessingFee = async (paymentId: string) => {
    try {
      await apiClient.updateProcessingFeePayment(paymentId, "verified");
      toast({
        title: "Processing Fee Verified",
        description: "Processing fee has been verified - user can now withdraw",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify processing fee",
        variant: "destructive",
      });
    }
  };

  const handleRejectProcessingFee = async (paymentId: string) => {
    try {
      await apiClient.updateProcessingFeePayment(
        paymentId,
        "rejected",
        "Invalid payment"
      );
      toast({
        title: "Processing Fee Rejected",
        description: "Processing fee has been rejected",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject processing fee",
        variant: "destructive",
      });
    }
  };

  const handleCompleteWithdrawal = async (requestId: string) => {
    try {
      await apiClient.updateWithdrawalRequest(
        requestId,
        "completed",
        undefined,
        "TX123456"
      );
      toast({
        title: "Withdrawal Completed",
        description: "Withdrawal has been completed successfully",
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete withdrawal",
        variant: "destructive",
      });
    }
  };

  // Restriction Handlers
  const handleRestrictUser = async () => {
    if (!restrictingUser) return;

    try {
      await apiClient.updateWithdrawalRestriction(
        restrictingUser._id,
        true,
        restrictionTitle.trim() || undefined,
        restrictionHeading.trim() || undefined,
        restrictionMessage.trim() || undefined
      );

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === restrictingUser._id
            ? {
                ...user,
                withdrawalRestricted: true,
                restrictionTitle: restrictionTitle.trim() || undefined,
                restrictionHeading: restrictionHeading.trim() || undefined,
                restrictionMessage: restrictionMessage.trim() || undefined,
              }
            : user
        )
      );

      toast({
        title: "Withdrawal restricted",
        description: `User ${restrictingUser.email} can no longer withdraw funds`,
      });

      // Close dialog and reset
      setRestrictionDialogOpen(false);
      setRestrictingUser(null);
      setRestrictionTitle("");
      setRestrictionHeading("");
      setRestrictionMessage("");
    } catch (e: any) {
      console.error('Restriction update error:', e);
      toast({
        title: "Action failed",
        description: e?.message || "Failed to update withdrawal restriction",
        variant: "destructive",
      });
    }
  };

  const handleUnrestrictUser = async (user: DatabaseUser) => {
    try {
      await apiClient.updateWithdrawalRestriction(user._id, false);

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === user._id
            ? {
                ...u,
                withdrawalRestricted: false,
                restrictionTitle: undefined,
                restrictionHeading: undefined,
                restrictionMessage: undefined,
              }
            : u
        )
      );

      toast({
        title: "Withdrawal restriction removed",
        description: `User ${user.email} can now withdraw funds`,
      });
    } catch (e: any) {
      console.error('Restriction update error:', e);
      toast({
        title: "Action failed",
        description: e?.message || "Failed to update withdrawal restriction",
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = () => {
    toast({
      title: "Feature Disabled",
      description: "Data clearing is disabled for safety",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Admin Dashboard
                </h1>
                <p className="text-red-100 text-sm sm:text-base">
                  Complete platform management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs sm:text-sm text-green-600">
                  {stats?.activeUsers || 0} verified
                </p>
              </div>
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Platform Value
                </p>
                <p className="text-xl sm:text-3xl font-bold">
                  ${(stats?.totalPlatformValue || 0).toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-green-600">
                  {stats?.totalInvestments || 0} investments
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pending KYC
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats?.pendingKyc || 0}
                </p>
                <p className="text-xs sm:text-sm text-orange-600">
                  Requires approval
                </p>
              </div>
              <Download className="h-8 w-8 sm:h-12 sm:w-12 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pending Deposits
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats?.pendingDeposits || 0}
                </p>
                <p className="text-xs sm:text-sm text-purple-600">
                  Requires verification
                </p>
              </div>
              <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pending Withdrawals
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats?.pendingWithdrawals || 0}
                </p>
                <p className="text-xs sm:text-sm text-red-600">
                  Requires approval
                </p>
              </div>
              <Download className="h-8 w-8 sm:h-12 sm:w-12 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="kyc" className="w-full">
          <TabsList className="flex w-full gap-2 overflow-x-auto whitespace-nowrap">
            <TabsTrigger className="text-xs sm:text-sm" value="users">
              Users
            </TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="kyc">
              KYC Requests
            </TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="deposits">
              Deposits
            </TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="processing-fees">
              Processing Fees
            </TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="withdrawals">
              Withdrawals
            </TabsTrigger>
            <TabsTrigger className="text-xs sm:text-sm" value="investments">
              Investments
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-3">
                  <h2 className="text-xl font-bold">Users</h2>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                      }}
                      className="border rounded px-3 py-2 text-sm w-full sm:w-[220px]"
                    />
                    <span className="text-sm text-muted-foreground">
                      Filter
                    </span>
                    <Select
                      onValueChange={(val) => {
                        // set simple local state via URL hash or component state
                        // We'll store filter in a data attribute on the container using state
                        setUsersFilter(val as "all" | "verified");
                        setUserPage(1);
                      }}
                      defaultValue="all"
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        <SelectItem value="verified">Verified only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Verified
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          KYC Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Withdrawal
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Joined
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        pagedUsers
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          )
                          .map((u) => (
                            <tr
                              key={u._id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium">{u.email}</span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    u.isVerified ? "default" : "secondary"
                                  }
                                >
                                  {u.isVerified ? "Yes" : "No"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    u.isDisabled ? "destructive" : "secondary"
                                  }
                                >
                                  {u.isDisabled ? "Disabled" : "Active"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    u.kycStatus === "approved"
                                      ? "default"
                                      : u.kycStatus === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {u.kycStatus || "none"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    u.withdrawalRestricted ? "destructive" : "secondary"
                                  }
                                >
                                  {u.withdrawalRestricted ? "Restricted" : "Active"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant={
                                      u.withdrawalRestricted ? "default" : "outline"
                                    }
                                    onClick={() => {
                                      if (u.withdrawalRestricted) {
                                        // Unrestrict - no dialog needed
                                        handleUnrestrictUser(u);
                                      } else {
                                        // Restrict - open dialog for custom message
                                        setRestrictingUser(u);
                                        setRestrictionTitle("");
                                        setRestrictionHeading("");
                                        setRestrictionMessage("");
                                        setRestrictionDialogOpen(true);
                                      }
                                    }}
                                  >
                                    {u.withdrawalRestricted ? "Unrestrict" : "Restrict"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(u.email);
                                      toast({ title: "User email copied" });
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      u.isDisabled ? "default" : "destructive"
                                    }
                                    onClick={async () => {
                                      try {
                                        await apiClient.updateUserDisabled(
                                          u._id,
                                          !u.isDisabled
                                        );
                                        toast({
                                          title: u.isDisabled
                                            ? "User enabled"
                                            : "User disabled",
                                        });
                                        fetchAdminData();
                                      } catch (e) {
                                        toast({
                                          title: "Action failed",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    {u.isDisabled ? "Enable" : "Disable"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          `Delete user ${u.email}? This cannot be undone.`
                                        )
                                      ) {
                                        try {
                                          await apiClient.deleteUser(u._id);
                                          toast({ title: "User deleted" });
                                          fetchAdminData();
                                        } catch (e) {
                                          toast({
                                            title: "Delete failed",
                                            variant: "destructive",
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {userPage} of {totalUserPages} •{" "}
                    {filteredUsersAll.length} users
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={userPage >= totalUserPages}
                      onClick={() =>
                        setUserPage((p) => Math.min(totalUserPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          {/* Investments Tab */}
          <TabsContent value="investments">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Active Investments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Tier
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Asset
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Period
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInvestments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No active investments found
                          </td>
                        </tr>
                      ) : (
                        activeInvestments.map((inv: any) => (
                          <tr
                            key={inv._id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              {inv.userId?.email || "Unknown User"}
                            </td>
                            <td className="py-3 px-4">{inv.tier}</td>
                            <td className="py-3 px-4">{inv.asset}</td>
                            <td className="py-3 px-4 font-mono">
                              ${inv.amount?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">{inv.period} days</td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  inv.status === "active"
                                    ? "secondary"
                                    : inv.status === "completed"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {inv.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(inv.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {inv.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        `Terminate this ${
                                          inv.tier
                                        } investment of $${inv.amount?.toLocaleString()}? Accrued earnings will be credited, and the investment will be cancelled.`
                                      )
                                    ) {
                                      try {
                                        const res =
                                          await apiClient.terminateInvestment(
                                            inv._id
                                          );
                                        toast({
                                          title: "Investment terminated",
                                          description: `Credited $${Number(
                                            res?.earningsCredited || 0
                                          ).toFixed(
                                            2
                                          )} in earnings to user balance`,
                                        });
                                        fetchAdminData();
                                      } catch (e) {
                                        toast({
                                          title: "Termination failed",
                                          description: "Please try again",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                >
                                  Terminate
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Investments</h2>
                    <p className="text-sm text-muted-foreground">
                      Track all users' investments
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Search by user email"
                      value={invEmailSearch}
                      onChange={(e) => {
                        setInvEmailSearch(e.target.value);
                        setInvPage(1);
                      }}
                      className="border rounded px-3 py-2 text-sm w-full sm:w-[220px]"
                    />
                    <Select
                      defaultValue={invStatusFilter}
                      onValueChange={(v) => {
                        setInvStatusFilter(v as any);
                        setInvPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      defaultValue={invAssetFilter}
                      onValueChange={(v) => {
                        setInvAssetFilter(v as any);
                        setInvPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All assets</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      defaultValue={invTierFilter}
                      onValueChange={(v) => {
                        setInvTierFilter(v as any);
                        setInvPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tiers</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(() => {
                  const list = (
                    allInvestments.length ? allInvestments : activeInvestments
                  ) as any[];
                  const filtered = list
                    .filter((i) =>
                      invStatusFilter === "all"
                        ? true
                        : (i.status || "").toLowerCase() === invStatusFilter
                    )
                    .filter((i) =>
                      invEmailSearch
                        ? (i.userId?.email || "")
                            .toLowerCase()
                            .includes(invEmailSearch.toLowerCase())
                        : true
                    )
                    .filter((i) =>
                      invAssetFilter === "all"
                        ? true
                        : (i.asset || "") === invAssetFilter
                    )
                    .filter((i) =>
                      invTierFilter === "all"
                        ? true
                        : (i.tier || "") === invTierFilter
                    );

                  const totalPages = Math.max(
                    1,
                    Math.ceil(filtered.length / invPageSize)
                  );
                  const page = Math.min(invPage, totalPages);
                  const paged = filtered.slice(
                    (page - 1) * invPageSize,
                    page * invPageSize
                  );
                  return (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                User
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Tier
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Asset
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Amount
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Period
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                APR
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Status
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Created
                              </th>
                              <th className="text-left py-3 px-4 text-xs sm:text-sm">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paged.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={9}
                                  className="py-8 text-center text-muted-foreground"
                                >
                                  No investments
                                </td>
                              </tr>
                            ) : (
                              paged.map((inv) => (
                                <tr
                                  key={inv._id}
                                  className="border-b hover:bg-muted/50"
                                >
                                  <td className="py-3 px-4">
                                    {inv.userId?.email || "Unknown"}
                                  </td>
                                  <td className="py-3 px-4">{inv.tier}</td>
                                  <td className="py-3 px-4">{inv.asset}</td>
                                  <td className="py-3 px-4 font-mono">
                                    ${inv.amount?.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4">{inv.period}d</td>
                                  <td className="py-3 px-4">
                                    {inv.apr ?? "-"}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge
                                      variant={
                                        inv.status === "active"
                                          ? "secondary"
                                          : inv.status === "completed"
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {inv.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    {new Date(
                                      inv.createdAt
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-4 flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setInvDetail(inv);
                                        setInvDetailOpen(true);
                                      }}
                                    >
                                      View
                                    </Button>
                                    {inv.status === "active" && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async () => {
                                          if (
                                            confirm(
                                              `Terminate this ${
                                                inv.tier
                                              } investment of $${inv.amount?.toLocaleString()}? Accrued earnings will be credited, and the investment will be cancelled.`
                                            )
                                          ) {
                                            try {
                                              const res =
                                                await apiClient.terminateInvestment(
                                                  inv._id
                                                );
                                              toast({
                                                title: "Investment terminated",
                                                description: `Credited $${Number(
                                                  res?.earningsCredited || 0
                                                ).toFixed(
                                                  2
                                                )} in earnings to user balance`,
                                              });
                                              fetchAdminData();
                                            } catch (e) {
                                              toast({
                                                title: "Termination failed",
                                                description: "Please try again",
                                                variant: "destructive",
                                              });
                                            }
                                          }
                                        }}
                                      >
                                        Terminate
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-muted-foreground">
                          Page {page} of{" "}
                          {Math.max(
                            1,
                            Math.ceil(filtered.length / invPageSize)
                          )}{" "}
                          • {filtered.length} investments
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() =>
                              setInvPage((p) => Math.max(1, p - 1))
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              page >=
                              Math.max(
                                1,
                                Math.ceil(filtered.length / invPageSize)
                              )
                            }
                            onClick={() =>
                              setInvPage((p) =>
                                Math.min(
                                  Math.max(
                                    1,
                                    Math.ceil(filtered.length / invPageSize)
                                  ),
                                  p + 1
                                )
                              )
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  KYC Verification Requests
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No KYC requests found
                          </td>
                        </tr>
                      ) : (
                        kycRequests.map((request: any) => (
                          <tr
                            key={request._id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              <p className="font-semibold text-sm">
                                {request.userId?.email || "Unknown User"}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm">
                                {request.firstName} {request.lastName}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  request.status === "approved"
                                    ? "default"
                                    : request.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm">
                                {new Date(
                                  request.submissionDate
                                ).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewKYC(request._id)}
                                >
                                  View
                                </Button>
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveKYC(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRejectKYC(request._id)
                                      }
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Deposit Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Asset
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No deposit requests found
                          </td>
                        </tr>
                      ) : (
                        depositRequests.map((request: any) => (
                          <tr
                            key={request._id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              <p className="font-semibold text-sm">
                                {request.userId?.email || "Unknown User"}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono">
                                ${request.amount?.toLocaleString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono">{request.asset}</p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  request.status === "verified"
                                    ? "default"
                                    : request.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {request.status === "pending" && (
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleVerifyDeposit(request._id)
                                    }
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleRejectDeposit(request._id)
                                    }
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Processing Fees Tab */}
          <TabsContent value="processing-fees">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Processing Fee Payments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Asset
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Submitted
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {processingFeePayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No processing fee payments found
                          </td>
                        </tr>
                      ) : (
                        processingFeePayments.map((payment: any) => (
                          <tr
                            key={payment._id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              <p className="font-semibold text-sm">
                                {payment.userId?.email || "Unknown User"}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono">
                                ${payment.amount?.toLocaleString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono">{payment.asset}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm">
                                {new Date(payment.submittedAt).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  payment.status === "verified"
                                    ? "default"
                                    : payment.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {payment.status === "pending" && (
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleVerifyProcessingFee(payment._id)
                                    }
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleRejectProcessingFee(payment._id)
                                    }
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Withdrawal Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Asset
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Wallet
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No withdrawal requests found
                          </td>
                        </tr>
                      ) : (
                        withdrawalRequests.map((request: any) => (
                          <tr
                            key={request._id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              <p className="font-semibold text-sm">
                                {request.userId?.email || "Unknown User"}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono">
                                ${request.amount?.toLocaleString()}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono">{request.asset}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono text-xs">
                                {request.walletAddress?.slice(0, 10)}...
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  request.status === "completed"
                                    ? "default"
                                    : request.status === "approved"
                                    ? "secondary"
                                    : request.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-2">
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleApproveWithdrawal(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRejectWithdrawal(request._id)
                                      }
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === "approved" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleCompleteWithdrawal(request._id)
                                    }
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* KYC Detail Viewer */}
      {/* Investment Detail Viewer */}
      <Dialog open={invDetailOpen} onOpenChange={setInvDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription>Inspect a user's investment with daily progress</DialogDescription>
          </DialogHeader>
          {invDetail ? (
            <div className="space-y-6">
              {/* Basic Investment Info */}
              <div className="grid grid-cols-2 gap-3 text-sm pb-4 border-b">
                <div>
                  <span className="text-muted-foreground block mb-1">User</span>
                  <span className="font-mono text-xs">{invDetail.userId?.email || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Created</span>
                  <span className="text-xs">{new Date(invDetail.createdAt).toLocaleString()}</span>
                </div>
                {invDetail.completedAt && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block mb-1">Completed</span>
                    <span className="text-xs">
                      {new Date(invDetail.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Daily Progress Tracker */}
              {invDetail.status === "active" && (
                <DailyProgressTracker 
                  investment={{
                    id: invDetail._id,
                    tier: invDetail.tier,
                    asset: invDetail.asset,
                    amount: invDetail.amount,
                    apr: invDetail.apr || 0,
                    period: invDetail.period,
                    startDate: invDetail.startDate || invDetail.createdAt,
                    endDate: invDetail.endDate || new Date(new Date(invDetail.createdAt).getTime() + invDetail.period * 24 * 60 * 60 * 1000).toISOString(),
                    earned: invDetail.earned || 0,
                    status: invDetail.status,
                    progress: invDetail.progress
                  }}
                />
              )}

              {/* Fallback for non-active investments */}
              {invDetail.status !== "active" && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier</span>
                    <span className="font-semibold">{invDetail.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset</span>
                    <span className="font-semibold">{invDetail.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono font-semibold">
                      ${invDetail.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period</span>
                    <span>{invDetail.period} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">APR</span>
                    <span>{invDetail.apr ?? "-"}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        invDetail.status === "completed"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {invDetail.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No details
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={kycViewOpen} onOpenChange={setKycViewOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Details</DialogTitle>
            <DialogDescription>
              View submitted identity information and document image
            </DialogDescription>
          </DialogHeader>
          {kycViewLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : kycDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {kycDetail.firstName} {kycDetail.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-mono text-sm">
                    {kycDetail.userId?.email || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document</p>
                  <p className="font-medium">
                    {kycDetail.documentType} • {kycDetail.documentNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{kycDetail.status}</p>
                </div>
              </div>

              {kycDetail.documentImageDataUrl ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ID Document Image
                  </p>
                  <img
                    src={kycDetail.documentImageDataUrl}
                    alt="KYC ID Document"
                    className="max-h-[60vh] w-auto rounded border"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No image attached
                </p>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No details available
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Restriction Dialog */}
      <Dialog open={restrictionDialogOpen} onOpenChange={setRestrictionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Restrict Withdrawal Access</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Enter custom alert details that will be shown to {restrictingUser?.email} when they try to withdraw or view the restriction alert.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restriction-title" className="text-sm">
                Alert Title
              </Label>
              <Input
                id="restriction-title"
                placeholder="e.g., Account Security Alert"
                value={restrictionTitle}
                onChange={(e) => setRestrictionTitle(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                If left empty, defaults to: "Account Security Alert"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restriction-heading" className="text-sm">
                Main Heading
              </Label>
              <Input
                id="restriction-heading"
                placeholder="e.g., Withdrawal Privileges..."
                value={restrictionHeading}
                onChange={(e) => setRestrictionHeading(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                If left empty, defaults to: "Withdrawal Privileges Temporarily Suspended"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restriction-message" className="text-sm">
                Detailed Message
              </Label>
              <Textarea
                id="restriction-message"
                placeholder="Enter the detailed reason for restriction..."
                value={restrictionMessage}
                onChange={(e) => setRestrictionMessage(e.target.value)}
                rows={6}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                If left empty, shows default security message about unrecognized wallet address.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-xs sm:text-sm mb-2">Preview:</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-red-600 break-words">
                  {restrictionTitle || "Account Security Alert"}
                </p>
                <p className="font-semibold break-words">
                  {restrictionHeading || "Withdrawal Privileges Temporarily Suspended"}
                </p>
                <p className="text-muted-foreground break-words">
                  {restrictionMessage ? (restrictionMessage.length > 150 ? restrictionMessage.substring(0, 150) + "..." : restrictionMessage) : "Our security system has detected that the last transaction (deposit) was made from an unrecognized wallet address..."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setRestrictionDialogOpen(false);
                  setRestrictingUser(null);
                  setRestrictionTitle("");
                  setRestrictionHeading("");
                  setRestrictionMessage("");
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRestrictUser}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Apply Restriction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
