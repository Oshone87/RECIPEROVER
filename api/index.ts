// Vercel serverless function entry point
import express from "express";
import cors from "cors";
import { connectDatabase } from "../server/config/database";
import { registerRoutes } from "../server/routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and routes
let isInitialized = false;

async function initializeApp() {
  if (!isInitialized) {
    try {
      console.log("🔗 Connecting to database...");
      await connectDatabase();
      console.log("✅ Database connected successfully");

      // Register API routes
      registerRoutes(app);

      // Health check
      app.get("/health", (req, res) => {
        res.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          mongodb: "connected",
        });
      });

      isInitialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize app:", error);
      throw error;
    }
  }
}

// Vercel handler
export default async function handler(req: any, res: any) {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
