/**
 * HTTP Server để cron-job.org trigger
 */

require("dotenv").config();

const express = require("express");
const { runDaily } = require("./reminderScheduler");

const app = express();
const PORT = process.env.PORT || 3456;
const API_SECRET = process.env.API_SECRET || "";

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ZNS Reminder Scheduler",
    time: new Date().toISOString(),
  });
});

// Trigger endpoint
app.post("/run-daily", async (req, res) => {
  // Check API secret
  const providedSecret = req.headers["x-api-secret"] || req.query.secret;
  
  if (!API_SECRET || providedSecret !== API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("\n🔔 Triggered by external cron job");
  
  // Chạy async, không chờ
  runDaily()
    .then(() => console.log("✅ Daily run completed"))
    .catch((error) => console.error("❌ Daily run failed:", error));

  // Response ngay
  res.json({
    status: "triggered",
    message: "Daily reminder process started",
    time: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Trigger URL: http://localhost:${PORT}/run-daily`);
  console.log(`🔑 API Secret: ${API_SECRET ? "configured" : "NOT SET"}`);
});
