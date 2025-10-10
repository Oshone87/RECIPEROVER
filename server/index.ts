import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDatabase } from "./config/database";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:5179",
      "http://localhost:5180",
      "http://localhost:5181",
      "http://localhost:5182",
      "http://localhost:5183",
      "http://localhost:5184",
      "http://localhost:5185",
      "http://localhost:5186",
      "http://localhost:5187",
      "https://crypto-invest-ip9u.vercel.app", // Your frontend domain
      "https://reciperover.vercel.app", // Alternative frontend domain
      "https://recipe-rover.vercel.app", // Another possible domain
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Database connection
(async () => {
  try {
    console.log("🔗 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully");

    // Register API routes
    registerRoutes(app);

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        mongodb: "connected",
      });
    });

    // Only start the server if we're not in a serverless environment
    if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
      const { createServer } = await import("http");
      const httpServer = createServer(app);

      const port = parseInt(process.env.PORT || "5000", 10);

      httpServer.listen(port, () => {
        log(`Server running on port ${port}`);
        console.log(`🌐 Server: http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
})();

// Export the app for Vercel
export { app };
