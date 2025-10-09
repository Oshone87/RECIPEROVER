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
app.use(cors());

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

        // Get local IP address for mobile access
        import("os").then(({ networkInterfaces }) => {
          const nets = networkInterfaces();
          let localIP = "localhost";

          for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
              const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
              if (
                net.family === familyV4Value &&
                !net.internal &&
                net.address !== "127.0.0.1"
              ) {
                localIP = net.address;
                break;
              }
            }
          }

          console.log("\n🌐 Network URLs:");
          console.log(`  Local:   http://localhost:${port}`);
          console.log(`  Mobile:  http://${localIP}:${port}`);
          console.log("\n📱 To view on your phone:");
          console.log(`  1. Make sure your phone is on the same WiFi network`);
          console.log(
            `  2. Open http://${localIP}:${port} in your phone's browser\n`
          );
        });
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();

// Export the app for Vercel
export { app };
