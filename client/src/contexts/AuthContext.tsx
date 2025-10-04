import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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
  const [, setLocation] = useLocation();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize with admin user if not exists
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const adminExists = registeredUsers.find(
      (u: any) => u.email === "admin@reciperover.com"
    );

    if (!adminExists) {
      const adminUser = {
        id: "admin_1",
        email: "admin@reciperover.com",
        password: "admin123",
        isVerified: true,
      };
      registeredUsers.push(adminUser);
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    }
  }, []);

  const signup = async (email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    if (existingUsers.find((u: any) => u.email === email)) {
      return false; // User already exists
    }

    // Add to registered users
    const userId = `user_${Date.now()}`;
    const newUser = { id: userId, email, password, isVerified: false };
    existingUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

    // Set current user
    const userData = { id: userId, email, isVerified: false };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const foundUser = registeredUsers.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Check if user was deleted by admin
      const adminUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      const adminUserExists = adminUsers.find(
        (u: any) => u.id === foundUser.id
      );

      // If user doesn't exist in admin system and it's not the admin user,
      // they might have been deleted
      if (!adminUserExists && email !== "admin@reciperover.com") {
        // User was deleted by admin, remove from registered users
        const updatedUsers = registeredUsers.filter(
          (u: any) => u.id !== foundUser.id
        );
        localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
        return false;
      }

      const userData = {
        id: foundUser.id || `user_${Date.now()}`,
        email: foundUser.email,
        isVerified: foundUser.isVerified,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Redirect to home page after logout
    setLocation("/");
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
