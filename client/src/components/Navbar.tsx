import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, TrendingUp } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 cursor-pointer">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">CryptoInvest</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" data-testid="link-home-nav">
              <span className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
                Home
              </span>
            </Link>
            <Link href="/dashboard" data-testid="link-dashboard">
              <span className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>
                Dashboard
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link href="/login" data-testid="link-login">
              <Button variant="ghost" size="default">Log in</Button>
            </Link>
            <Link href="/signup" data-testid="link-signup">
              <Button variant="default" size="default">Sign up</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
