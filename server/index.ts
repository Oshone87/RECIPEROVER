import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDatabase } from "./config/database";

const app = express();

// CORS handling MUST come first - be completely permissive for now
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Log the origin for debugging
  console.log(`🌐 Request from origin: ${origin}`);

  // Be completely permissive with CORS for debugging
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, HEAD"
  );
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Expose-Headers", "*");

  console.log(`✅ CORS headers set for origin: ${origin}`);

  // Handle preflight requests immediately
  if (req.method === "OPTIONS") {
    console.log(`🔧 Handling OPTIONS preflight request for ${req.path}`);
    res.status(200).end();
    return;
  }

  next();
});

// Security middleware (disabled for CORS debugging)
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );

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

    // CORS test endpoint
    app.get("/api/cors-test", (req: Request, res: Response) => {
      res.json({
        status: "CORS working",
        origin: req.headers.origin,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
    });

    // Test POST endpoint for CORS
    app.post("/api/cors-test", (req: Request, res: Response) => {
      res.json({
        status: "CORS POST working",
        origin: req.headers.origin,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString(),
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
