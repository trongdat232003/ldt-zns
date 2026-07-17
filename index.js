/**
 * ============================================================================
 * ZNS AUTO REMINDER - MAIN FILE
 * Gửi tin nhắn ZNS tự động cho khách hàng sau X phút/ngày từ lần mua cuối
 * ============================================================================
 */

// Load environment variables từ .env file
require("dotenv").config();

const {
  getAllInvoices,
  filterInvoicesDue,
  getCustomerPhone,
  sendZNSForInvoice,
} = require("./simpleReminder");
const {
  filterNotSentRecently,
  markAsSent,
} = require("./simpleReminderLog");
const {
  loadOilProductIds,
  filterOilChangeInvoices,
} = require("./matchOilInvoices");
const {
  createMockInvoices,
  getMockCustomerPhone,
} = require("./mockData");

// ============================================================================
// CẤU HÌNH - Thay đổi ở đây
// ============================================================================

const CONFIG = {
  // ZNS API - ĐỌC TỪ ENVIRONMENT VARIABLES (BẢO MẬT)
  ZNS_API_KEY: process.env.ZNS_API_KEY || "",
  ZNS_TEMPLATE_ID: parseInt(process.env.ZNS_TEMPLATE_ID || "499462"),

  // Thời gian nhắc nhở
  MINUTES_SINCE_PURCHASE: parseInt(process.env.MINUTES_SINCE_PURCHASE || "43200"),    // 30 ngày = 43200 phút
  MINUTES_BETWEEN_REMINDERS: parseInt(process.env.MINUTES_BETWEEN_REMINDERS || "36000"), // 25 ngày = 36000 phút

  // Giới hạn số tin gửi mỗi lần chạy (để tránh spam)
  MAX_SEND_PER_RUN: parseInt(process.env.MAX_SEND_PER_RUN || "50"),
  
  // DRY RUN MODE: true = không gửi thật, false = gửi thật
  DRY_RUN: process.env.DRY_RUN === "true",
  
  // MOCK DATA MODE: true = dùng dữ liệu giả, false = dùng dữ liệu thật từ KiotViet
  USE_MOCK_DATA: process.env.USE_MOCK_DATA === "true",
};

// ============================================================================
// HÀM CHÍNH - Chạy toàn bộ flow
// ============================================================================

async function runAutoReminder(config = CONFIG) {
  console.log("🚀 ZNS AUTO REMINDER - STARTING...\n");
  
  // ========================================================================
  // DRY RUN MODE & MOCK DATA MODE
  // ========================================================================
  if (config.USE_MOCK_DATA) {
    console.log("=" .repeat(70));
    console.log("🎭 MOCK DATA MODE - DÙNG DỮ LIỆU GIẢ");
    console.log("=" .repeat(70));
    console.log("Chế độ này sẽ:");
    console.log("  ❌ KHÔNG gọi API KiotViet");
    console.log("  ✅ Dùng 5 hóa đơn giả (mockData.js)");
    console.log("  ✅ SĐT test: 0362832045");
    console.log("=" .repeat(70));
    console.log("");
  }
  
  if (config.DRY_RUN) {
    console.log("=" .repeat(70));
    console.log("🧪 DRY RUN MODE - KHÔNG GỬI TIN THẬT");
    console.log("=" .repeat(70));
    console.log("Chế độ này sẽ:");
    console.log("  ✅ Lọc và xử lý như bình thường");
    console.log("  ❌ KHÔNG GỬI ZNS (chỉ hiển thị)");
    console.log("=" .repeat(70));
    console.log("");
  }
  
  // ========================================================================
  // VALIDATE ENVIRONMENT VARIABLES (BẢO MẬT)
  // ========================================================================
  if (!config.DRY_RUN && !config.ZNS_API_KEY) {
    console.error("❌ ERROR: ZNS_API_KEY is missing!");
    console.error("   Please set environment variable: ZNS_API_KEY");
    return { success: false, error: "Missing ZNS_API_KEY" };
  }

  console.log("=" .repeat(70));
  console.log("⚙️  CONFIG:");
  console.log(`   Data: ${config.USE_MOCK_DATA ? '🎭 MOCK (Giả)' : '💾 REAL (Thật từ KiotViet)'}`);
  console.log(`   Mode: ${config.DRY_RUN ? '🧪 DRY RUN (Test)' : '🚀 PRODUCTION (Real)'}`);
  console.log(`   Minutes since purchase: ${config.MINUTES_SINCE_PURCHASE} (${Math.floor(config.MINUTES_SINCE_PURCHASE / 1440)} days)`);
  console.log(`   Minutes between reminders: ${config.MINUTES_BETWEEN_REMINDERS} (${Math.floor(config.MINUTES_BETWEEN_REMINDERS / 1440)} days)`);
  console.log(`   Max send per run: ${config.MAX_SEND_PER_RUN}`);
  console.log(`   ZNS Template ID: ${config.ZNS_TEMPLATE_ID}`);
  if (!config.DRY_RUN) {
    console.log(`   ZNS API Key: ${config.ZNS_API_KEY.substring(0, 20)}...`); // Chỉ show 20 ký tự đầu
  }
  console.log("=" .repeat(70));

  try {
    // ========================================================================
    // BƯỚC 0: Load danh sách sản phẩm nhớt
    // ========================================================================
    console.log("\n🛢️  [0/7] Loading oil product IDs...");
    let oilProductIds = [];
    try {
      oilProductIds = loadOilProductIds();
      console.log(`✅ Loaded ${oilProductIds.length} oil product IDs`);
    } catch (error) {
      console.warn("⚠️  Warning: Could not load oil_product_ids.json");
      console.warn("   Run 'node getOilProducts.js' to generate the file");
      console.warn("   Continuing without oil filter (will process all invoices)");
    }

    // ========================================================================
    // BƯỚC 1: Lấy tất cả hóa đơn (từ KiotViet hoặc Mock)
    // ========================================================================
    console.log("\n📋 [1/7] Getting invoices...");
    const startTime = Date.now();
    
    let allInvoices;
    if (config.USE_MOCK_DATA) {
      allInvoices = createMockInvoices();
      console.log(`✅ Created ${allInvoices.length} mock invoices`);
    } else {
      allInvoices = await getAllInvoices({ pageSize: 100 });
      const fetchTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Fetched ${allInvoices.length} invoices in ${fetchTime}s`);
    }

    // ========================================================================
    // BƯỚC 2: Lọc hóa đơn đủ thời gian
    // ========================================================================
    console.log(`\n⏰ [2/7] Filtering invoices (${config.MINUTES_SINCE_PURCHASE}+ minutes)...`);
    const dueInvoices = filterInvoicesDue(allInvoices, config.MINUTES_SINCE_PURCHASE);
    console.log(`✅ Found ${dueInvoices.length} invoices due for reminder`);

    if (dueInvoices.length === 0) {
      console.log("\n✅ No invoices need reminder at this time.");
      return { success: true, sent: 0, skipped: 0, failed: 0, totalDue: 0 };
    }

    // ========================================================================
    // BƯỚC 3: Lọc chỉ lấy hóa đơn THAY NHỚT
    // ========================================================================
    let oilChangeInvoices = dueInvoices;
    
    if (oilProductIds.length > 0) {
      console.log(`\n🛢️  [3/7] Filtering oil change invoices...`);
      oilChangeInvoices = filterOilChangeInvoices(dueInvoices, oilProductIds);
      console.log(`✅ Found ${oilChangeInvoices.length} oil change invoices`);
      console.log(`   (Filtered out ${dueInvoices.length - oilChangeInvoices.length} non-oil invoices)`);
      
      if (oilChangeInvoices.length === 0) {
        console.log("\n✅ No oil change invoices need reminder at this time.");
        return { success: true, sent: 0, skipped: 0, failed: 0, totalDue: dueInvoices.length, oilChangeOnly: 0 };
      }
    } else {
      console.log(`\n⚠️  [3/7] Skipping oil filter (file not found)`);
    }

    // ========================================================================
    // BƯỚC 4: Lọc bỏ hóa đơn đã gửi gần đây
    // ========================================================================
    console.log(`\n🔍 [4/7] Filtering already sent (within ${config.MINUTES_BETWEEN_REMINDERS} minutes)...`);
    const invoicesToSend = filterNotSentRecently(oilChangeInvoices, config.MINUTES_BETWEEN_REMINDERS);
    console.log(`✅ ${invoicesToSend.length} invoices to send`);

    // Giới hạn số lượng gửi
    const limitedInvoices = invoicesToSend.slice(0, config.MAX_SEND_PER_RUN);
    if (limitedInvoices.length < invoicesToSend.length) {
      console.log(`⚠️  Limited to ${config.MAX_SEND_PER_RUN} invoices (${invoicesToSend.length - limitedInvoices.length} will be sent next time)`);
    }

    console.log("\n" + "=" .repeat(70));
    console.log(`📤 [5/7] SENDING ZNS TO ${limitedInvoices.length} INVOICES`);
    console.log("=" .repeat(70));

    // ========================================================================
    // BƯỚC 5-7: Lấy SĐT, Gửi ZNS, Lưu log
    // ========================================================================
    const results = {
      sent: 0,
      failed: 0,
      skipped: dueInvoices.length - invoicesToSend.length,
      totalDue: dueInvoices.length,
      oilChangeOnly: oilChangeInvoices.length,
    };

    for (let i = 0; i < limitedInvoices.length; i++) {
      const invoice = limitedInvoices[i];
      
      console.log(`\n[${i + 1}/${limitedInvoices.length}] 📄 Invoice: ${invoice.invoiceCode}`);
      console.log(`    Customer: ${invoice.customerName} (${invoice.customerCode})`);
      console.log(`    Date: ${invoice.purchaseDate.toLocaleDateString("vi-VN")}`);
      console.log(`    Time ago: ${invoice.minutesSince} minutes (${invoice.daysSince} days)`);
      console.log(`    Products: ${invoice.productNames}`);
      console.log(`    Total: ${invoice.total.toLocaleString("vi-VN")} VNĐ`);

      // Lấy số điện thoại
      console.log(`    📞 Getting phone number...`);
      let phone;
      if (config.USE_MOCK_DATA) {
        phone = await getMockCustomerPhone(invoice.customerId);
      } else {
        phone = await getCustomerPhone(invoice.customerId);
      }
      
      if (!phone) {
        console.log(`    ⚠️  No phone number - SKIP`);
        results.failed += 1;
        continue;
      }

      invoice.phone = phone;
      console.log(`    📱 Phone: ${phone}`);

      try {
        // Gửi ZNS
        if (config.DRY_RUN) {
          // DRY RUN: Không gửi thật, chỉ hiển thị
          console.log(`    🧪 [DRY RUN] Would send ZNS to ${phone}`);
          console.log(`       Template: ${config.ZNS_TEMPLATE_ID}`);
          console.log(`       Customer: ${invoice.customerName}`);
          console.log(`       Products: ${invoice.productNames}`);
          
          results.sent += 1;
          
          // Vẫn log để test logic
          markAsSent(invoice, { 
            success: true, 
            status: 200, 
            response: { message: "DRY RUN - Not sent" } 
          });
          console.log(`    💾 Logged (dry run)`);
        } else {
          // PRODUCTION: Gửi thật
          console.log(`    📤 Sending ZNS...`);
          const result = await sendZNSForInvoice(
            invoice,
            config.ZNS_API_KEY,
            config.ZNS_TEMPLATE_ID
          );

          if (result.success) {
            console.log(`    ✅ SUCCESS - Status: ${result.status}`);
            results.sent += 1;

            // Lưu log
            markAsSent(invoice, result);
            console.log(`    💾 Logged to file`);
          } else {
            console.log(`    ❌ FAILED - Status: ${result.status}`);
            console.log(`    Response: ${JSON.stringify(result.response)}`);
            results.failed += 1;
          }
        }
      } catch (error) {
        console.log(`    ❌ ERROR: ${error.message}`);
        results.failed += 1;
      }

      // Delay để tránh spam API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // ========================================================================
    // TỔNG KẾT
    // ========================================================================
    console.log("\n" + "=" .repeat(70));
    console.log("📊 SUMMARY");
    console.log("=" .repeat(70));
    console.log(`📋 Total invoices fetched: ${allInvoices.length}`);
    console.log(`⏰ Invoices due for reminder: ${results.totalDue}`);
    console.log(`🛢️  Oil change invoices: ${results.oilChangeOnly}`);
    console.log(`⏭️  Skipped (sent recently): ${results.skipped}`);
    console.log(`📤 Attempted to send: ${limitedInvoices.length}`);
    console.log(`✅ Sent successfully: ${results.sent}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log("=" .repeat(70));

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log("=" .repeat(70));

    return { success: true, ...results };
  } catch (error) {
    console.error("\n" + "=" .repeat(70));
    console.error("❌ PROCESS FAILED");
    console.error("=" .repeat(70));
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("=" .repeat(70));
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EXPORT & CHẠY
// ============================================================================

module.exports = {
  runAutoReminder,
  CONFIG,
};

// Nếu chạy trực tiếp: node index.js
if (require.main === module) {
  runAutoReminder()
    .then((result) => {
      if (result.success) {
        console.log("\n✅ Process completed successfully");
        process.exit(0);
      } else {
        console.error("\n❌ Process failed");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ Process crashed:", error);
      process.exit(1);
    });
}
