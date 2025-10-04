import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, TrendingUp, LogOut, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

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
            <Link href="/admin-dashboard">
              <div
                className="w-2 h-2 rounded-full bg-primary opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer ml-1"
                title="Admin Access"
                data-testid="admin-secret-dot"
              ></div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="user-menu"
                    className="max-w-[120px] sm:max-w-none"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="truncate text-xs sm:text-sm">
                      {user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={logout}
                    data-testid="logout-button"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
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
    </nav>
  );
}
