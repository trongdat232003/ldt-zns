const {
  getCustomerPhone,
  sendZNSForInvoice,
} = require("../simpleReminder");
const {
  loadDueTodayReminders,
  markReminderAsSent,
} = require("./reminderStorage");

/**
 * Check và gửi reminders đến hạn HÔM NAY
 */
async function sendDueReminders() {
  console.log("\n" + "=".repeat(70));
  console.log("📤 STEP 2: SEND DUE REMINDERS");
  console.log("=".repeat(70));

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  console.log(`\n📅 Today: ${todayStr}`);
  console.log(`📂 Loading due reminders from Supabase...`);

  // Lấy reminders đến hạn hôm nay và chưa gửi
  const dueToday = await loadDueTodayReminders();

  console.log(`⏰ Due today (not sent): ${dueToday.length}`);

  if (dueToday.length === 0) {
    console.log("✅ No reminders to send today");
    return { sent: 0, failed: 0 };
  }

  // Config
  const DRY_RUN = process.env.DRY_RUN === "true";
  const ZNS_API_KEY = process.env.ZNS_API_KEY || "";
  const ZNS_TEMPLATE_ID = parseInt(process.env.ZNS_TEMPLATE_ID || "499462");

  if (!DRY_RUN && !ZNS_API_KEY) {
    console.error("❌ Missing ZNS_API_KEY");
    return { sent: 0, failed: 0 };
  }

  console.log(`\n🚀 Mode: ${DRY_RUN ? "DRY RUN (test)" : "PRODUCTION (real)"}`);
  console.log("\n" + "=".repeat(70));

  // Gửi ZNS
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < dueToday.length; i++) {
    const reminder = dueToday[i];

    console.log(`\n[${i + 1}/${dueToday.length}] 📄 ${reminder.invoice_code}`);
    console.log(`    Customer: ${reminder.customer_name} (${reminder.customer_code})`);
    console.log(`    Purchase: ${reminder.purchase_date}`);
    console.log(`    Due: ${reminder.due_date}`);

    // Lấy SĐT
    console.log(`    📞 Getting phone...`);
    const phone = await getCustomerPhone(reminder.customer_id);

    if (!phone) {
      console.log(`    ⚠️  No phone - SKIP`);
      failed++;
      continue;
    }

    console.log(`    📱 Phone: ${phone}`);

    try {
      if (DRY_RUN) {
        // DRY RUN: không gửi thật
        console.log(`    🧪 [DRY RUN] Would send ZNS`);
        console.log(`       Template: ${ZNS_TEMPLATE_ID}`);
        console.log(`       ✅ Simulated SUCCESS`);

        // Đánh dấu đã gửi
        await markReminderAsSent(reminder.invoice_code);
        sent++;
      } else {
        // PRODUCTION: gửi thật
        console.log(`    📤 Sending ZNS...`);

        const invoice = {
          invoiceCode: reminder.invoice_code,
          invoiceId: reminder.invoice_id,
          customerName: reminder.customer_name,
          customerCode: reminder.customer_code,
          phone,
        };

        const result = await sendZNSForInvoice(
          invoice,
          ZNS_API_KEY,
          ZNS_TEMPLATE_ID
        );

        if (result.success) {
          console.log(`    ✅ SUCCESS - Status: ${result.status}`);

          // Đánh dấu đã gửi
          await markReminderAsSent(reminder.invoice_code);
          sent++;
        } else {
          console.log(`    ❌ FAILED - Status: ${result.status}`);
          console.log(`    Response: ${JSON.stringify(result.response)}`);
          failed++;
        }
      }
    } catch (error) {
      console.log(`    ❌ ERROR: ${error.message}`);
      failed++;
    }

    // Delay 1s
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(70));
  console.log("📊 SUMMARY");
  console.log("=".repeat(70));
  console.log(`📤 Attempted: ${dueToday.length}`);
  console.log(`✅ Sent: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("=".repeat(70));

  return { sent, failed };
}

module.exports = {
  sendDueReminders,
};
