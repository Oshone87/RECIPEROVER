import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Types
interface DatabaseUser {
  _id: string;
  email: string;
  isVerified: boolean;
  kycStatus: string;
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

export default function AdminDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);
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

  // Check admin access and fetch data
  useEffect(() => {
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

    fetchAdminData();
  }, [isAuthenticated, user, setLocation, toast]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [
        usersResponse,
        statsResponse,
        kycResponse,
        depositsResponse,
        withdrawalsResponse,
      ] = await Promise.all([
        apiClient.getAllUsers(),
        apiClient.getPlatformStats(),
        apiClient.getKYCRequests(),
        apiClient.getDepositRequests(),
        apiClient.getWithdrawalRequests(),
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
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="text-sm">Clear All Data</span>
            </Button>
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
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="kyc" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kyc">KYC Requests</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

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
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
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
                              {request.status === "pending" && (
                                <div className="flex gap-2">
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
                                    onClick={() => handleRejectKYC(request._id)}
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

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Deposit Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Asset</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
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
                                <div className="flex gap-2">
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

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Withdrawal Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Asset</th>
                        <th className="text-left py-3 px-4">Wallet</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
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
                              <div className="flex gap-2">
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
    </div>
  );
}
