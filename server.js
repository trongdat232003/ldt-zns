/**
 * ============================================================================
 * API SERVER - Để n8n gọi qua HTTP Request
 * Chạy: node server.js
 * ============================================================================
 */

// Load environment variables từ .env file
require("dotenv").config();

const express = require("express");
const { runAutoReminder, CONFIG } = require("./index");

const app = express();
const PORT = 3456; // Port tùy chọn

// Middleware
app.use(express.json());

// API Key authentication middleware
const API_SECRET = process.env.API_SECRET || "your-secret-key-change-this-123456";

function authenticate(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  
  if (!apiKey || apiKey !== API_SECRET) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Invalid API Key",
    });
  }
  
  next();
}

// Health check (không cần auth)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ZNS Auto Reminder API",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint để chạy reminder (CÓ AUTH)
app.post("/run-reminder", authenticate, async (req, res) => {
  console.log("\n" + "=".repeat(70));
  console.log("📥 Received request from n8n");
  console.log("Time:", new Date().toLocaleString("vi-VN"));
  console.log("=".repeat(70) + "\n");

  try {
    // Chạy auto reminder
    const result = await runAutoReminder(CONFIG);

    // Trả về kết quả
    res.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      data: {
        sent: result.sent || 0,
        failed: result.failed || 0,
        skipped: result.skipped || 0,
        totalDue: result.totalDue || 0,
        oilChangeOnly: result.oilChangeOnly || 0,
      },
      message: result.success 
        ? `✅ Sent ${result.sent} ZNS messages successfully`
        : `❌ Process failed: ${result.error}`,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      message: "❌ Process crashed",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("╔" + "═".repeat(68) + "╗");
  console.log("║" + " ".repeat(15) + "ZNS AUTO REMINDER API SERVER" + " ".repeat(24) + "║");
  console.log("║" + " ".repeat(68) + "║");
  console.log(`║  🚀 Server running on: http://localhost:${PORT}` + " ".repeat(22) + "║");
  console.log(`║  📡 Endpoint: POST http://localhost:${PORT}/run-reminder` + " ".repeat(11) + "║");
  console.log("║" + " ".repeat(68) + "║");
  console.log("║  Ready to receive requests from n8n..." + " ".repeat(27) + "║");
  console.log("╚" + "═".repeat(68) + "╝");
});
