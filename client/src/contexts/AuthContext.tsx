import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";
import { apiClient } from "../lib/apiClient";

interface User {
  id: string;
  email: string;
  role: string; // "user" or "admin" from backend
  kycStatus: string;
  isVerified: boolean;
  isAdmin: boolean; // computed from role
  balance: {
    USDT: number;
    BTC: number;
    ETH: number;
    BNB: number;
  };
  hasCompletedKYC: boolean; // computed from kycStatus
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If token is invalid, clear it
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.register(email, password);
      setUser(response.user);
      return true;
    } catch (error: any) {
      console.error("Signup failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);

      // Transform backend user data to match frontend interface
      const userData = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        kycStatus: response.user.kycStatus,
        isVerified: response.user.isVerified,
        isAdmin: response.user.role === "admin",
        hasCompletedKYC: response.user.kycStatus === "approved",
        balance: {
          USDT: 0,
          BTC: 0,
          ETH: 0,
          BNB: 0,
        },
      };

      setUser(userData);

      // Navigate based on user role
      setTimeout(() => {
        if (userData.isAdmin) {
          setLocation("/admin-dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 100);

      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    // Redirect to home page after logout
    setLocation("/");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
