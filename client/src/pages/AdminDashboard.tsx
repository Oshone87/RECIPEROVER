import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Clock,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const {
    users,
    getAllUsers,
    getUserById,
    suspendUser,
    activateUser,
    deleteUser,
    allInvestments,
    getUserInvestments,
    cancelInvestment,
    completeInvestment,
    allTransactions,
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
  } = useAdmin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // State for various modals and forms
  const [modalOpen, setModalOpen] = useState<string>("");

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    // Check if user is admin (you can implement proper admin role checking)
    if (user?.email !== "admin@reciperover.com") {
      setLocation("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user, setLocation, toast]);

  if (!isAuthenticated || user?.email !== "admin@reciperover.com") {
    return null;
  }

  const stats = getPlatformStats();
  const pendingWithdrawals = getPendingWithdrawals();
  const pendingDeposits = getPendingDeposits();
  const pendingKyc = getPendingKYC();

  const handleApproveKYC = (requestId: string) => {
    approveKYC(requestId, "KYC approved by admin");
    toast({
      title: "KYC Approved",
      description:
        "KYC verification has been approved and user is now verified.",
    });
  };

  const handleRejectKYC = (requestId: string) => {
    rejectKYC(requestId, "KYC rejected by admin");
    toast({
      title: "KYC Rejected",
      description: "KYC verification has been rejected.",
    });
  };

  const handleApproveWithdrawal = (requestId: string) => {
    approveWithdrawal(requestId, "Approved by admin");
    toast({
      title: "Withdrawal Approved",
      description: "Withdrawal request has been approved.",
    });
  };

  const handleRejectWithdrawal = (requestId: string) => {
    rejectWithdrawal(requestId, "Rejected by admin");
    toast({
      title: "Withdrawal Rejected",
      description: "Withdrawal request has been rejected.",
    });
  };

  const handleVerifyDeposit = (requestId: string) => {
    verifyDeposit(requestId, "Verified by admin");
    toast({
      title: "Deposit Verified",
      description: "Deposit has been verified and funds added to user account.",
    });
  };

  const handleRejectDeposit = (requestId: string) => {
    rejectDeposit(requestId, "Rejected by admin");
    toast({
      title: "Deposit Rejected",
      description: "Deposit request has been rejected.",
    });
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${userEmail}? This action cannot be undone and will remove all their data including investments and transactions.`
      )
    ) {
      deleteUser(userId);
      toast({
        title: "User Deleted",
        description: `User ${userEmail} has been permanently deleted.`,
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        `Are you sure you want to clear ALL data? This will remove all users, investments, transactions, deposits, and withdrawals. This action cannot be undone!`
      )
    ) {
      // Clear all localStorage data
      localStorage.removeItem("adminUsers");
      localStorage.removeItem("adminInvestments");
      localStorage.removeItem("adminTransactions");
      localStorage.removeItem("adminWithdrawals");
      localStorage.removeItem("adminDeposits");

      // Clear user data as well
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const adminOnly = registeredUsers.filter(
        (user: any) => user.email === "admin@reciperover.com"
      );
      localStorage.setItem("registeredUsers", JSON.stringify(adminOnly));

      // Refresh the page to reload clean state
      window.location.reload();

      toast({
        title: "All Data Cleared",
        description: "All platform data has been permanently deleted.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats.totalUsers}
                </p>
                <p className="text-xs sm:text-sm text-green-600">
                  {stats.activeUsers} active
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
                  ${stats.totalPlatformValue.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-green-600">
                  {stats.totalInvestments} investments
                </p>
              </div>
              <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pending Withdrawals
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {stats.pendingWithdrawals}
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
                  {stats.pendingDeposits}
                </p>
                <p className="text-xs sm:text-sm text-purple-600">
                  Requires verification
                </p>
              </div>
              <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          {/* Mobile: Stacked Layout */}
          <div className="block sm:hidden">
            <TabsList className="grid w-full grid-cols-4 gap-1">
              <TabsTrigger value="users" className="text-xs px-2 py-2">
                Users
              </TabsTrigger>
              <TabsTrigger value="investments" className="text-xs px-2 py-2">
                Invest
              </TabsTrigger>
              <TabsTrigger value="kyc" className="text-xs px-2 py-2">
                KYC
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs px-2 py-2">
                Actions
              </TabsTrigger>
            </TabsList>
            <div className="mt-2">
              <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger value="withdrawals" className="text-xs px-2 py-2">
                  Withdraw
                </TabsTrigger>
                <TabsTrigger value="deposits" className="text-xs px-2 py-2">
                  Deposits
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs px-2 py-2">
                  Txns
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Desktop: Single Row Layout */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="users" className="text-sm px-3">
                Users
              </TabsTrigger>
              <TabsTrigger value="investments" className="text-sm px-3">
                Investments
              </TabsTrigger>
              <TabsTrigger value="kyc" className="text-sm px-3">
                KYC Requests
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-sm px-3">
                Withdrawals
              </TabsTrigger>
              <TabsTrigger value="deposits" className="text-sm px-3">
                Deposits
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-sm px-3">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-sm px-3">
                Actions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  User Management
                </h2>
                <div className="text-sm text-muted-foreground">
                  User management through automated system only. Manual fund
                  manipulation is disabled.
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : user.status === "suspended"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {user.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Balance</p>
                          <p className="font-mono font-semibold">
                            ${user.balance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-mono font-semibold">
                            ${user.totalInvested.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earnings</p>
                          <p className="font-mono font-semibold text-green-600">
                            +${user.totalEarnings.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Joined</p>
                          <p className="font-semibold">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="text-xs">View</span>
                        </Button>
                        {user.status === "active" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              suspendUser(user.id, "Suspended by admin")
                            }
                            className="flex-1 h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Suspend</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => activateUser(user.id)}
                            className="flex-1 h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Activate</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          title="Delete User Permanently"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm">User</th>
                      <th className="text-left py-3 px-4 text-sm">Balance</th>
                      <th className="text-left py-3 px-4 text-sm">Invested</th>
                      <th className="text-left py-3 px-4 text-sm">Earnings</th>
                      <th className="text-left py-3 px-4 text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-sm">Joined</th>
                      <th className="text-left py-3 px-4 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          ${user.balance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          ${user.totalInvested.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-green-600 text-sm">
                          +${user.totalEarnings.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "suspended"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.status === "active" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  suspendUser(user.id, "Suspended by admin")
                                }
                                className="h-8 w-8 p-0"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => activateUser(user.id)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteUser(user.id, user.email)
                              }
                              title="Delete User Permanently"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Investment Management
                </h2>
                <div className="text-sm text-muted-foreground">
                  Investment oversight through automated system only. Manual
                  investment manipulation is disabled.
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {allInvestments.map((investment) => (
                  <Card key={investment.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">
                            {investment.userEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {investment.tier} • {investment.asset}
                          </p>
                        </div>
                        <Badge
                          variant={
                            investment.status === "active"
                              ? "default"
                              : investment.status === "completed"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {investment.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-mono font-semibold">
                            ${investment.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earned</p>
                          <p className="font-mono font-semibold text-green-600">
                            +${investment.earned.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Progress
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.min(100, investment.progress)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold">
                            {investment.progress.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {investment.status === "active" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeInvestment(investment.id)}
                            className="flex-1 h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Complete</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              cancelInvestment(
                                investment.id,
                                "Cancelled by admin"
                              )
                            }
                            className="flex-1 h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Cancel</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Investment</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Earned</th>
                      <th className="text-left py-3 px-4">Progress</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInvestments.map((investment) => (
                      <tr
                        key={investment.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold">
                            {investment.userEmail}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{investment.tier}</p>
                            <p className="text-sm text-muted-foreground">
                              {investment.asset}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          ${investment.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-green-600">
                          +${investment.earned.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    investment.progress
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm">
                              {investment.progress.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              investment.status === "active"
                                ? "default"
                                : investment.status === "completed"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {investment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {investment.status === "active" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    completeInvestment(investment.id)
                                  }
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    cancelInvestment(
                                      investment.id,
                                      "Cancelled by admin"
                                    )
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* KYC Requests Tab */}
          <TabsContent value="kyc">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  KYC Verification Requests
                </h2>
                <div className="text-sm text-muted-foreground">
                  Review and approve user identity verification documents.
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {pendingKyc.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending KYC requests
                  </div>
                ) : (
                  pendingKyc.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">
                              {request.userEmail}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.firstName} {request.lastName}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {request.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Document</p>
                            <p className="font-semibold">
                              {request.documentType}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Country</p>
                            <p className="font-semibold">{request.country}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-semibold">
                              {request.phoneNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submitted</p>
                            <p className="font-semibold">
                              {new Date(
                                request.submissionDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Address</p>
                          <p className="font-semibold">
                            {request.address}, {request.city}, {request.country}
                          </p>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveKYC(request.id)}
                              className="flex-1 h-8"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span className="text-xs">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectKYC(request.id)}
                              className="flex-1 h-8"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              <span className="text-xs">Reject</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                {pendingKyc.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending KYC requests
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm">User</th>
                        <th className="text-left py-3 px-4 text-sm">
                          Document
                        </th>
                        <th className="text-left py-3 px-4 text-sm">Country</th>
                        <th className="text-left py-3 px-4 text-sm">Phone</th>
                        <th className="text-left py-3 px-4 text-sm">
                          Submitted
                        </th>
                        <th className="text-left py-3 px-4 text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingKyc.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-sm">
                                {request.userEmail}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.firstName} {request.lastName}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {request.documentType}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {request.country}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {request.phoneNumber}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(
                              request.submissionDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-xs">
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {request.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveKYC(request.id)}
                                  className="h-8"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectKYC(request.id)}
                                  className="h-8"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Withdrawal Requests
              </h2>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {withdrawalRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">
                            {request.userEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.asset}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "secondary"
                              : request.status === "approved"
                              ? "default"
                              : request.status === "completed"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-mono font-semibold">
                            ${request.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-semibold">
                            {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Wallet Address
                        </p>
                        <code className="text-xs bg-muted p-1 rounded break-all">
                          {request.walletAddress}
                        </code>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveWithdrawal(request.id)}
                            className="flex-1 h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectWithdrawal(request.id)}
                            className="flex-1 h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Reject</span>
                          </Button>
                        </div>
                      )}
                      {request.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeWithdrawal(request.id)}
                          className="w-full h-8"
                        >
                          <span className="text-xs">Mark Complete</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                {withdrawalRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No withdrawal requests found.
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Asset</th>
                      <th className="text-left py-3 px-4">Wallet</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold">{request.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          ${request.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{request.asset}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs">
                            {request.walletAddress}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              request.status === "pending"
                                ? "secondary"
                                : request.status === "approved"
                                ? "default"
                                : request.status === "completed"
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
                                  handleApproveWithdrawal(request.id)
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleRejectWithdrawal(request.id)
                                }
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {request.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeWithdrawal(request.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {withdrawalRequests.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No withdrawal requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card className="p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Deposit Requests
              </h2>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {depositRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">
                            {request.userEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.asset}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "secondary"
                              : request.status === "verified"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-mono font-semibold">
                            ${request.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-semibold">
                            {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          TX Hash
                        </p>
                        <code className="text-xs bg-muted p-1 rounded break-all">
                          {request.transactionHash || "N/A"}
                        </code>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyDeposit(request.id)}
                            className="flex-1 h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Verify</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectDeposit(request.id)}
                            className="flex-1 h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Reject</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {depositRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No deposit requests found.
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Asset</th>
                      <th className="text-left py-3 px-4">TX Hash</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold">{request.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          ${request.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{request.asset}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs">
                            {request.transactionHash || "N/A"}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              request.status === "pending"
                                ? "secondary"
                                : request.status === "verified"
                                ? "default"
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
                                onClick={() => handleVerifyDeposit(request.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectDeposit(request.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {depositRequests.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No deposit requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                All Transactions
              </h2>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {allTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">
                            {transaction.userEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.type} • {transaction.asset}
                          </p>
                        </div>
                        <Badge
                          variant={
                            transaction.status === "Completed"
                              ? "default"
                              : transaction.status === "Pending"
                              ? "secondary"
                              : transaction.status === "Processing"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-mono font-semibold">
                            ${transaction.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-semibold">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {transaction.description && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Description
                          </p>
                          <p className="text-xs bg-muted p-2 rounded">
                            {transaction.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {allTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Asset</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold">
                            {transaction.userEmail}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{transaction.type}</td>
                        <td className="py-3 px-4">{transaction.asset}</td>
                        <td className="py-3 px-4 font-mono">
                          ${transaction.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              transaction.status === "Completed"
                                ? "default"
                                : transaction.status === "Pending"
                                ? "secondary"
                                : transaction.status === "Processing"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.description}
                        </td>
                      </tr>
                    ))}
                    {allTransactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    All user operations are managed through automated systems.
                    Manual interventions have been disabled for platform
                    integrity.
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {stats.totalUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Users
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {stats.totalInvestments}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Investments
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Pending Withdrawals</span>
                    </div>
                    <Badge variant="secondary">
                      {stats.pendingWithdrawals}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Pending Deposits</span>
                    </div>
                    <Badge variant="secondary">{stats.pendingDeposits}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending KYC</span>
                    </div>
                    <Badge variant="secondary">{pendingKyc.length}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
