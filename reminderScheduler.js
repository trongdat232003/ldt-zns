// Load environment variables
require("dotenv").config();

const { collectNewReminders } = require("./lib/reminderCollector");
const { sendDueReminders } = require("./lib/reminderSender");

/**
 * MAIN: Chạy cả 2 bước
 */
async function runDaily() {
  console.log("\n" + "=".repeat(70));
  console.log("🤖 ZNS REMINDER SCHEDULER - DAILY RUN");
  console.log("=".repeat(70));
  console.log(`⏰ Time: ${new Date().toLocaleString("vi-VN")}`);

  try {
    // Bước 1: Collect new reminders
    await collectNewReminders();

    // Bước 2: Send due reminders
    await sendDueReminders();

    console.log("\n✅ Daily run completed successfully");
  } catch (error) {
    console.error("\n❌ Daily run failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export
module.exports = {
  collectNewReminders,
  sendDueReminders,
  runDaily,
};

// Chạy nếu gọi trực tiếp
if (require.main === module) {
  runDaily();
}
