const {
  getAllInvoices,
  getOilProductIds,
  filterOilInvoices,
  getCustomerPhone,
} = require("../simpleReminder");
const { saveReminders, reminderExists } = require("./reminderStorage");

/**
 * Lấy hoá đơn mới và tạo reminders
 */
async function collectNewReminders() {
  console.log("\n" + "=".repeat(70));
  console.log("📥 STEP 1: COLLECT NEW REMINDERS");
  console.log("=".repeat(70));

  // Lấy hoá đơn mới (incremental sync)
  console.log("\n📋 Fetching new invoices...");
  const invoices = await getAllInvoices({
    pageSize: 100,
    useIncrementalSync: true,
  });

  if (invoices.length === 0) {
    console.log("✅ No new invoices");
    return 0;
  }

  // Lấy danh sách nhớt
  console.log("\n🛢️  Loading oil product IDs...");
  const oilProductIds = await getOilProductIds();

  // Lọc hoá đơn nhớt
  console.log("\n🛢️  Filtering oil invoices...");
  const oilInvoices = filterOilInvoices(invoices, oilProductIds);
  console.log(
    `✅ Found ${oilInvoices.length} oil invoices (out of ${invoices.length})`,
  );

  if (oilInvoices.length === 0) {
    console.log("✅ No oil invoices to schedule");
    return 0;
  }

  // Tạo reminders
  console.log("\n📅 Creating reminders...");
  const newReminders = {};
  let newCount = 0;
  let skipCount = 0;
  let noPhoneCount = 0;

  for (const invoice of oilInvoices) {
    // Check đã tồn tại chưa
    const exists = await reminderExists(invoice.code);
    if (exists) {
      skipCount++;
      continue;
    }

    // Lấy SĐT từ API khách hàng KiotViet bằng customerId
    const phone = await getCustomerPhone(invoice.customerId);

    // Bỏ qua nếu không có SĐT
    if (!phone) {
      noPhoneCount++;
      console.warn(
        `⚠️  No phone found for customer ${invoice.customerId || "unknown"}`,
      );
      continue;
    }

    const purchaseDate = new Date(invoice.purchaseDate);
    const dueDate = new Date(purchaseDate);
    dueDate.setDate(dueDate.getDate() + 30); // +30 ngày

    newReminders[invoice.code] = {
      invoice_code: invoice.code,
      invoice_id: invoice.id,
      customer_id: invoice.customerId,
      customer_code: invoice.customerCode,
      customer_name: invoice.customerName,
      phone: phone,
      purchase_date: purchaseDate.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      total: invoice.total,
      products:
        invoice.invoiceDetails?.slice(0, 3).map((item) => ({
          name: item.productName,
          quantity: item.quantity,
        })) || [],
      sent: false,
      sent_at: null,
    };
    newCount++;
  }

  // Lưu vào Supabase
  if (newCount > 0) {
    console.log(`💾 Saving ${newCount} new reminders to Supabase...`);
    await saveReminders(newReminders);
    console.log(`✅ Saved successfully`);
  }

  if (skipCount > 0) {
    console.log(`⏭️  Skipped ${skipCount} existing reminders`);
  }

  console.log(`\n✅ Total new reminders: ${newCount}`);
  return newCount;
}

module.exports = {
  collectNewReminders,
};
