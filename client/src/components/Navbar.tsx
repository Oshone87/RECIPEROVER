import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  TrendingUp,
  LogOut,
  User,
  Settings,
  Shield,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestment } from "@/contexts/InvestmentContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { TbCurrencySolana } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const { getAssetBalance } = useInvestment();
  const [, setLocation] = useLocation();
  const [promo, setPromo] = useState<any | null>(null);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  // KYC status from authenticated user (backend source of truth)
  const kycInfo = {
    isVerified: !!user?.isVerified,
    kycStatus: user?.kycStatus || "not_submitted",
  } as const;

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (!user) return;

    // Remove user from auth system
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const updatedUsers = registeredUsers.filter((u: any) => u.id !== user.id);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    // Remove user's individual data
    localStorage.removeItem(`userBalance_${user.id}`);
    localStorage.removeItem(`userAssetBalances_${user.id}`);
    localStorage.removeItem(`userInvestments_${user.id}`);
    localStorage.removeItem(`userTransactions_${user.id}`);

    // Remove from admin system
    const adminUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
    const updatedAdminUsers = adminUsers.filter((u: any) => u.id !== user.id);
    localStorage.setItem("adminUsers", JSON.stringify(updatedAdminUsers));

    // Logout and redirect
    logout();
    setLocation("/");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 gap-2 sm:gap-4">
          <div className="flex items-center gap-1 min-w-0">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-2 sm:px-3 py-2 cursor-pointer">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-lg sm:text-xl font-bold hidden xs:block">
                  CryptoInvest
                </span>
                <span className="text-lg sm:text-xl font-bold block xs:hidden">
                  CI
                </span>
              </div>
            </Link>
            {/* Secret admin access dot - only visible on hover */}
            <Link href="/admin-login">
              <div
                className="w-2 h-2 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer ml-1"
                title="Admin Access"
                data-testid="admin-secret-dot"
              ></div>
            </Link>
          </div>

          {/* Asset Breakdown in Navbar - Only show on dashboard */}
          {isAuthenticated && location === "/dashboard" && (
            <div className="hidden lg:flex items-center gap-4 mx-4">
              {/* Bitcoin Balance */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <SiBitcoin className="h-4 w-4 text-orange-500" />
                <div className="text-xs">
                  <span className="text-orange-800 dark:text-orange-200 font-medium">
                    BTC
                  </span>
                  <span className="ml-1 font-mono text-orange-900 dark:text-orange-100">
                    ${getAssetBalance("BTC").toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Ethereum Balance */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <SiEthereum className="h-4 w-4 text-blue-500" />
                <div className="text-xs">
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    ETH
                  </span>
                  <span className="ml-1 font-mono text-blue-900 dark:text-blue-100">
                    ${getAssetBalance("ETH").toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Solana Balance */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <TbCurrencySolana className="h-4 w-4 text-purple-500" />
                <div className="text-xs">
                  <span className="text-purple-800 dark:text-purple-200 font-medium">
                    SOL
                  </span>
                  <span className="ml-1 font-mono text-purple-900 dark:text-purple-100">
                    ${getAssetBalance("SOL").toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links - Show when not on dashboard or when on mobile */}
          <div
            className={`hidden md:flex items-center gap-6 ${
              isAuthenticated && location === "/dashboard" ? "lg:hidden" : ""
            }`}
          >
            <Link href="/" data-testid="link-home-nav">
              <span
                className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${
                  location === "/" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Home
              </span>
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" data-testid="link-dashboard">
                <span
                  className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${
                    location === "/dashboard"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Dashboard
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu
                onOpenChange={async (open) => {
                  if (open) {
                    try {
                      const p = await (
                        await import("@/lib/apiClient")
                      ).apiClient.getPromoX2Status();
                      setPromo(p);
                    } catch {}
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="user-menu"
                    className="max-w-[120px] sm:max-w-none gap-1 sm:gap-2"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate text-xs sm:text-sm">
                      {user?.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="text-sm font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Earn x2 section */}
                  <DropdownMenuLabel className="pt-0">
                    Earn x2
                  </DropdownMenuLabel>
                  <div className="px-2 pb-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={
                          promo?.isOfferDay ? "destructive" : "secondary"
                        }
                        disabled={!promo?.isOfferDay}
                        onClick={async () => {
                          if (!promo?.isOfferDay) return;
                          try {
                            if (!promo?.activated) {
                              await (
                                await import("@/lib/apiClient")
                              ).apiClient.activatePromoX2();
                            }
                            // set flag so dashboard auto-opens investment modal
                            try {
                              sessionStorage.setItem(
                                "openInvestmentEarnX2",
                                "1"
                              );
                              // If we're already on the dashboard, dispatch an event to open the modal immediately
                              if (location === "/dashboard") {
                                window.dispatchEvent(
                                  new CustomEvent("earnx2:open")
                                );
                              } else {
                                setLocation("/dashboard");
                              }
                            } catch {}
                          } catch {}
                        }}
                        className="flex-1"
                      >
                        {promo?.isOfferDay
                          ? promo?.activated
                            ? "x2 Active"
                            : "Earn x2 Today"
                          : "Earn x2"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLearnMoreOpen(true)}
                      >
                        Learn more
                      </Button>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* KYC Status Section */}
                  <DropdownMenuItem
                    onClick={() => setLocation("/kyc")}
                    className="flex-col items-start space-y-1 py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          KYC Verification
                        </span>
                      </div>
                      <Badge
                        variant={
                          kycInfo.isVerified
                            ? "default"
                            : kycInfo.kycStatus === "pending"
                            ? "secondary"
                            : kycInfo.kycStatus === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {kycInfo.isVerified ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </div>
                        ) : kycInfo.kycStatus === "pending" ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </div>
                        ) : kycInfo.kycStatus === "rejected" ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Rejected
                          </div>
                        ) : (
                          "Not Submitted"
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {kycInfo.isVerified
                        ? "Your identity has been verified"
                        : kycInfo.kycStatus === "pending"
                        ? "Your KYC is under review"
                        : kycInfo.kycStatus === "rejected"
                        ? "Please resubmit your KYC"
                        : "Complete your identity verification"}
                    </p>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={logout}
                    data-testid="logout-button"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Delete Account */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                        data-testid="delete-account-button"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete Account</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers, including:
                          <br />• All investment history
                          <br />• Transaction records
                          <br />• Account balance
                          <br />• KYC verification status
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login" data-testid="link-login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" data-testid="link-signup">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Learn more modal */}
      <Dialog open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Earn x2 — How it works</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Every Friday, if you activate Earn x2 and make a verified deposit
            that is up to 50% of your last deposit, your APR is doubled for
            today’s investments and tier minimums are waived.
          </p>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
