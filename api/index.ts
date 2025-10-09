// Simple test handler for Vercel
export default async function handler(req: any, res: any) {
  try {
    if (req.url === "/health") {
      return res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Simple handler working",
      });
    }

    return res.json({ message: "API is working" });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
