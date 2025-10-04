import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Check, X, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  validatePassword,
  getPasswordStrength,
} from "@/lib/passwordValidation";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = validatePassword(password);
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      toast({
        title: "Password too weak",
        description: "Please follow the password requirements",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(email, password);

      if (success) {
        toast({
          title: "Account created!",
          description:
            "Welcome to CryptoInvest. Please complete KYC verification.",
        });
        setLocation("/kyc");
      } else {
        toast({
          title: "Error",
          description: "Email already exists. Please use a different email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CryptoInvest</span>
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Start investing in crypto today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              data-testid="input-signup-email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="signup-password">Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="password-toggle"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              data-testid="input-signup-password"
            />
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === "strong"
                          ? "bg-green-500 w-full"
                          : passwordStrength === "medium"
                          ? "bg-yellow-500 w-2/3"
                          : "bg-red-500 w-1/3"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength === "strong"
                        ? "text-green-600"
                        : passwordStrength === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </div>
                <div className="space-y-1">
                  {passwordValidation.errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                    >
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">{error}</span>
                    </div>
                  ))}
                  {passwordValidation.isValid && (
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">
                        Password meets all requirements
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                data-testid="confirm-password-toggle"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              data-testid="input-signup-confirm-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !passwordValidation.isValid}
            data-testid="button-signup-submit"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login">
            <a
              className="text-primary hover:underline"
              data-testid="link-login-from-signup"
            >
              Sign in
            </a>
          </Link>
        </div>
      </Card>
    </div>
  );
}
