import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import investmentRoutes from "./routes/investments";
import balanceRoutes from "./routes/balances";
import adminRoutes from "./routes/admin";
import requestRoutes from "./routes/requests";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Investment routes
  app.use("/api/investments", investmentRoutes);

  // Balance routes
  app.use("/api/balances", balanceRoutes);

  // Request routes (KYC, Deposits, Withdrawals)
  app.use("/api/requests", requestRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
