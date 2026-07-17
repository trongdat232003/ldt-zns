/**
 * ============================================================================
 * RUN DAILY - File đơn giản để chạy hàng ngày qua n8n
 * Chạy: node runDaily.js
 * ============================================================================
 */

// Load environment variables từ .env file
require("dotenv").config();

const { runAutoReminder, CONFIG } = require("./index");

console.log("╔" + "═".repeat(68) + "╗");
console.log("║" + " ".repeat(15) + "ZNS AUTO REMINDER - DAILY RUN" + " ".repeat(24) + "║");
console.log("║" + " ".repeat(20) + new Date().toLocaleString("vi-VN") + " ".repeat(20) + "║");
console.log("╚" + "═".repeat(68) + "╝");
console.log("");

// Chạy với config mặc định (30 ngày)
runAutoReminder(CONFIG)
  .then((result) => {
    console.log("\n╔" + "═".repeat(68) + "╗");
    if (result.success) {
      console.log("║  ✅ COMPLETED SUCCESSFULLY" + " ".repeat(40) + "║");
      console.log("║" + " ".repeat(68) + "║");
      console.log(`║  📤 Sent: ${result.sent}` + " ".repeat(58 - result.sent.toString().length) + "║");
      console.log(`║  ❌ Failed: ${result.failed}` + " ".repeat(56 - result.failed.toString().length) + "║");
    } else {
      console.log("║  ❌ PROCESS FAILED" + " ".repeat(48) + "║");
      console.log("║" + " ".repeat(68) + "║");
      console.log(`║  Error: ${result.error}` + " ".repeat(60 - result.error.length) + "║");
    }
    console.log("╚" + "═".repeat(68) + "╝");
    
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n╔" + "═".repeat(68) + "╗");
    console.error("║  ❌ PROCESS CRASHED" + " ".repeat(47) + "║");
    console.error("║" + " ".repeat(68) + "║");
    console.error(`║  ${error.message}` + " ".repeat(67 - error.message.length) + "║");
    console.error("╚" + "═".repeat(68) + "╝");
    process.exit(1);
  });
